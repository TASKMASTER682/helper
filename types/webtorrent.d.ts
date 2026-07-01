declare module 'webtorrent' {
  interface TorrentFile {
    name: string;
    length: number;
    stream(): ReadableStream;
    renderTo(elem: HTMLVideoElement | string, opts?: any): void;
  }

  interface Torrent {
    infoHash: string;
    magnetURI: string;
    files: TorrentFile[];
    destroy(callback?: () => void): void;
  }

  interface WebTorrentOptions {
    urlList?: string[];
    announce?: string[];
    maxWebConns?: number;
    path?: string;
    store?: any;
  }

  class WebTorrent {
    constructor(opts?: any);
    torrents: Torrent[];
    add(
      torrentId: string | { infoHash: string } | ArrayBuffer,
      opts?: WebTorrentOptions,
      callback?: (torrent: Torrent) => void
    ): Torrent;
    seed(
      input: Blob | File | Buffer | Uint8Array,
      opts?: { name?: string; urlList?: string[] },
      callback?: (torrent: Torrent) => void
    ): Torrent;
    remove(torrentHash: string, callback?: () => void): void;
    destroy(callback?: () => void): void;
    get(torrentHash: string): Torrent | null;
  }

  export = WebTorrent;
}
