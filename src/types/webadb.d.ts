declare module 'webadb' {
  interface AdbOpt {
    debug: boolean;
    dump: boolean;
    key_size: number;
    reuse_key: number;
    use_checksum: boolean;
  }

  interface AdbMessage {
    cmd: string;
    arg0: number;
    arg1: number;
    length: number;
    data: DataView | null;
  }

  interface AdbStream {
    service: string;
    local_id: number;
    remote_id: number;
    close(): Promise<void>;
    send(cmd: string, data?: ArrayBuffer | null): Promise<void>;
    receive(): Promise<AdbMessage>;
    send_receive(cmd: string, data?: ArrayBuffer | null): Promise<AdbMessage>;
  }

  interface AdbDevice {
    transport: AdbTransport;
    max_payload: number;
    banner: string;
    serial: string;
    shell(command: string): Promise<AdbStream>;
    open(service: string): Promise<AdbStream>;
    sync(): Promise<AdbStream>;
    reboot(command?: string): Promise<AdbStream>;
    tcpip(port: number): Promise<AdbStream>;
    send(data: ArrayBuffer | string): Promise<void>;
    receive(len: number): Promise<DataView>;
  }

  interface AdbTransport {
    close(): Promise<void>;
    reset(): Promise<void>;
    send(ep: number, data: ArrayBuffer): Promise<void>;
    receive(ep: number, len: number): Promise<DataView>;
    connectAdb(banner: string, authUserNotify?: () => void): Promise<AdbDevice>;
    connectFastboot(): Promise<any>;
    isAdb(): boolean;
    isFastboot(): boolean;
    device: USBDevice;
  }

  interface AdbStatic {
    Opt: AdbOpt;
    open(transport: 'WebUSB'): Promise<AdbTransport>;
    WebUSB: {
      Transport: {
        new(device: USBDevice): AdbTransport;
        open(): Promise<AdbTransport>;
      };
    };
  }

  const Adb: AdbStatic;
  export default Adb;
}
