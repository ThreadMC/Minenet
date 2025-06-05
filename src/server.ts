import * as net from "net";

/**
 * Provides methods for interacting with Minecraft servers (ping, status, query, legacy ping).
 */
export class Server {
  /**
   * Get the status of a Minecraft server using the server list ping protocol.
   * @param host The server hostname or IP.
   * @param port The server port (default 25565).
   * @returns The server status response.
   */
  async getStatus(host: string, port: number = 25565): Promise<any> {
    return await this.ping(host, port, true);
  }

  /**
   * Ping a Minecraft server and return latency (ms).
   * @param host The server hostname or IP.
   * @param port The server port (default 25565).
   * @param returnStatus If true, return status JSON instead of latency.
   * @returns The latency in ms or the status JSON.
   */
  async ping(
    host: string,
    port: number = 25565,
    returnStatus = false,
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const socket = new net.Socket();
      let start = Date.now();
      let receivedData = Buffer.alloc(0);

      socket.setTimeout(5000);

      socket.connect(port, host, () => {
        const hostBuf = Buffer.from(host, "utf8");
        const handshake = Buffer.concat([
          Buffer.from([0x00]),
          Buffer.from([0x00]),
          Buffer.from([hostBuf.length]),
          hostBuf,
          Buffer.from([(port >> 8) & 0xff, port & 0xff]),
          Buffer.from([0x01]),
        ]);
        const handshakePacket = Buffer.concat([
          Buffer.from([handshake.length]),
          handshake,
        ]);
        socket.write(handshakePacket);

        socket.write(Buffer.from([0x01, 0x00]));
      });

      socket.on("data", (data) => {
        receivedData = Buffer.concat([receivedData, data]);
        try {
          let offset = 0;
          const length = receivedData.readVarInt(offset);
          offset += getVarIntSize(receivedData, offset);
          const packetId = receivedData.readVarInt(offset);
          offset += getVarIntSize(receivedData, offset);

          if (packetId === 0x00) {
            const jsonLength = receivedData.readVarInt(offset);
            offset += getVarIntSize(receivedData, offset);
            const json = receivedData
              .slice(offset, offset + jsonLength)
              .toString("utf8");
            socket.destroy();
            if (returnStatus) {
              resolve(JSON.parse(json));
            } else {
              resolve(Date.now() - start);
            }
          }
        } catch {
          // Wait for more data
        }
      });

      socket.on("timeout", () => {
        socket.destroy();
        reject(new Error("Timeout connecting to server"));
      });

      socket.on("error", (err) => {
        socket.destroy();
        reject(err);
      });
    });
  }

  /**
   * Query a Minecraft server for player/sample info (requires server.properties enable-query=true).
   * @param host The server hostname or IP.
   * @param port The query port (default 25565).
   * @returns The query response JSON.
   */
  async query(host: string, port: number = 25565): Promise<any> {
    const dgram = await import("dgram");
    return new Promise((resolve, reject) => {
      const client = dgram.createSocket("udp4");
      const sessionId = Math.floor(Math.random() * 0xffffffff);
      const handshake = Buffer.from([
        0xfe,
        0xfd,
        0x09,
        (sessionId >> 24) & 0xff,
        (sessionId >> 16) & 0xff,
        (sessionId >> 8) & 0xff,
        sessionId & 0xff,
      ]);
      let token: number | null = null;
      let timeout: NodeJS.Timeout;

      client.send(handshake, 0, handshake.length, port, host);

      client.on("message", (msg) => {
        if (msg[0] === 0x09 && token === null) {
          token = parseInt(msg.slice(5, msg.length - 1).toString());
          const req = Buffer.concat([
            Buffer.from([
              0xfe,
              0xfd,
              0x00,
              (sessionId >> 24) & 0xff,
              (sessionId >> 16) & 0xff,
              (sessionId >> 8) & 0xff,
              sessionId & 0xff,
            ]),
            Buffer.from(token.toString()),
            Buffer.alloc(4),
          ]);
          client.send(req, 0, req.length, port, host);
        } else if (msg[0] === 0x00 && token !== null) {
          client.close();
          clearTimeout(timeout);
          resolve(parseQueryResponse(msg));
        }
      });

      timeout = setTimeout(() => {
        client.close();
        reject(new Error("Timeout querying server"));
      }, 5000);

      client.on("error", (err) => {
        client.close();
        clearTimeout(timeout);
        reject(err);
      });
    });
  }

  /**
   * Legacy ping for Minecraft servers (1.6 and below).
   * @param host The server hostname or IP.
   * @param port The server port (default 25565).
   * @returns The legacy ping response.
   */
  async legacyPing(host: string, port: number = 25565): Promise<any> {
    return new Promise((resolve, reject) => {
      const socket = new net.Socket();
      socket.setTimeout(5000);
      socket.connect(port, host, () => {
        socket.write(Buffer.from([0xfe, 0x01]));
      });
      socket.on("data", (data) => {
        socket.destroy();
        // Parse legacy ping response
        const str = data.toString("ucs2", 3);
        const parts = str.split("\0");
        resolve({
          protocol: parts[1],
          version: parts[2],
          motd: parts[3],
          onlinePlayers: parts[4],
          maxPlayers: parts[5],
        });
      });
      socket.on("timeout", () => {
        socket.destroy();
        reject(new Error("Timeout connecting to server"));
      });
      socket.on("error", (err) => {
        socket.destroy();
        reject(err);
      });
    });
  }
}

/**
 * Helper to get the size of a VarInt in a buffer.
 * @param buf The buffer.
 * @param offset The offset to start reading.
 * @returns The size in bytes.
 */
function getVarIntSize(buf: Buffer, offset: number): number {
  let size = 0;
  while (true) {
    if ((buf[offset + size] & 0x80) !== 0x80) break;
    size++;
  }
  return size + 1;
}

/**
 * Parse the response from a Minecraft server query.
 * @param msg The response buffer.
 * @returns The parsed query response.
 */
function parseQueryResponse(msg: Buffer): any {
  let offset = 5;
  const data: any = {};
  const str = msg.slice(offset).toString("utf8");
  const parts = str.split("\0");
  for (let i = 0; i < parts.length - 1; i += 2) {
    if (parts[i].length === 0) break;
    data[parts[i]] = parts[i + 1];
  }
  return data;
}

declare global {
  interface Buffer {
    /**
     * Read a VarInt from the buffer at the given offset.
     * @param offset The offset to start reading.
     * @returns The integer value.
     */
    readVarInt(offset: number): number;
  }
}

Buffer.prototype.readVarInt = function (offset: number): number {
  let num = 0;
  let shift = 0;
  let pos = offset;
  let byte = 0;
  do {
    byte = this[pos++];
    num |= (byte & 0x7f) << shift;
    shift += 7;
  } while (byte & 0x80);
  return num;
};
