class RTCHandshake {
  static with_peer(pc, send_msg) {
    return new this(pc, send_msg)}

  static create(send_msg) {
    return this.with_cfg(this.cfg_std(), send_msg)}

  static with_cfg(cfg, send_msg) {
    const pc = new RTCPeerConnection(cfg);
    return this.with_peer(pc, send_msg)}

  static cfg_std() {return {
    sdpSemantics: 'unified-plan'
  , iceServers:[
      {urls: 'stun:stun1.l.google.com:19302'} ] } }


  constructor(pc, send_msg) {
    if ('function' !== typeof send_msg) {throw new TypeError}

    this.pc = pc;
    this.send_msg = send_msg;
    pc.addEventListener('icecandidate', this._evt_ice.bind(this, send_msg)); }

  _evt_ice(send_msg, {candidate}) {
    if (candidate) {
      send_msg(candidate);} }

  async rtc_initiate() {
    const {pc} = this;
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    await this.send_msg(offer);}

  async _rtc_offer(offer) {
    const {pc} = this;
    if (null != pc.remoteDescription) {
      return}

    await pc.setRemoteDescription(offer);

    if (null == pc.localDescription) {
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      await this.send_msg(answer);} }

  async _rtc_ice(msg) {
    const ice = new RTCIceCandidate(msg);
    await this.pc.addIceCandidate(ice);}

  async on_rtc_msg(msg) {
    try {
      if (msg.candidate) {
        return this._rtc_ice(msg)}
      else if (msg.sdp) {
        return this._rtc_offer(msg)} }
    catch (err) {
      this._on_msg_error(msg, err);} }

  _on_msg_error(msg, err) {
    console.warn("RTC error:", err); } }

export default RTCHandshake;
export { RTCHandshake };
//# sourceMappingURL=rtc_handshake.mjs.map
