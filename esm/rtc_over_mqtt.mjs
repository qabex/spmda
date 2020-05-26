import mqtt_v4 from 'https://cdn.jsdelivr.net/npm/u8-mqtt/esm/web/v4.mjs';

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
    pc.addEventListener('icecandidate', this._evt_ice.bind(this, send_msg));

    this.has_connected = new Promise(on_connected =>(
      this.has_ended = new Promise(on_ended =>(
        this.pc.addEventListener('connectionstatechange',
          this._evt_state.bind(this, on_connected, on_ended)) ) ) ) ); }

  _evt_ice(send_msg, {candidate}) {
    if (candidate) {
      send_msg(candidate);} }

  _evt_state(on_connected, on_ended) {
    switch (this.pc.connectionState) {
      case 'connected':
        return on_connected(this)

      case 'disconnected': case 'failed': case 'closed':
        return on_ended(this)} }


  async rtc_initiate() {
    const {pc} = this;
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    await this.send_msg(offer);
    return pc}

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
        return await this._rtc_ice(msg)}
      else if (msg.sdp) {
        return await this._rtc_offer(msg)} }
    catch (err) {
      this._on_msg_error(msg, err);} }

  _on_msg_error(msg, err) {
    console.warn("RTC error:", err); } }

async function rtc_mqtt_server(opt) {
  opt.mqtt = mqtt_v4()
    .with_websock(opt.websock);

  await opt.mqtt.connect();
  return _rtc_mqtt_server(opt)}


async function rtc_mqtt_client(opt) {
  opt.mqtt = mqtt_v4()
    .with_websock(opt.websock);

  await opt.mqtt.connect();
  return _rtc_mqtt_client(opt)}



function _rtc_mqtt_server(opt) {
  const _bind_send = opt.bind_send || _bind_mqtt_send;
  const _bind_recv = opt.bind_recv || _bind_mqtt_recv;

  const _by_chan = new Map();

  _bind_recv(opt, `${opt.topic}/m/:chan_id`,
    (async ( pkt, {chan_id} ) => {
      let rtc = _by_chan.get(chan_id);
      if (undefined === rtc) {
        rtc = await _init_handshake(chan_id);}

      await rtc.on_rtc_msg(pkt.json());}) );


  async function _init_handshake(chan_id) {
    const chan_send = _bind_send(opt, `${opt.topic}/c/${chan_id}`);
    const rtc = RTCHandshake.create(chan_send);

    rtc.has_ended.then (() => {
      _by_chan.delete(chan_id);});
    _by_chan.set(chan_id, rtc);

    if (opt.on_connection) {
      opt.on_connection(rtc.pc);}
    return rtc} }



function _rtc_mqtt_client(opt) {
  const _bind_send = opt.bind_send || _bind_mqtt_send;
  const _bind_recv = opt.bind_recv || _bind_mqtt_recv;

  const chan_id = opt.chan_id || Math.random().toString(36).slice(2);
  const chan_send = _bind_send(opt, `${opt.topic}/m/${chan_id}`);

  let rtc = RTCHandshake.create(chan_send);

  _bind_recv(opt, `${opt.topic}/c/${chan_id}`,
    (async ( pkt ) => {
      await rtc.on_rtc_msg(pkt.json());}) );

  if (opt.on_connection) {
    opt.on_connection(rtc.pc);}

  return rtc.rtc_initiate()}



function _bind_mqtt_send(opt, topic) {
  return opt.mqtt.json_send(topic)}

function _bind_mqtt_recv(opt, topic, on_pkt) {
  return opt.mqtt.subscribe_topic(topic, on_pkt)}

export { _rtc_mqtt_client, _rtc_mqtt_server, rtc_mqtt_client, rtc_mqtt_server };
//# sourceMappingURL=rtc_over_mqtt.mjs.map
