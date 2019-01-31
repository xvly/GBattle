export default class AudioManager {
    private static caches: { [url: string]: any } = {};

    public static setup() {
        let audioV = Laya.LocalStorage.getItem("audio");
        Laya.SoundManager.muted = audioV == "1";

        if (Laya.Browser.onWeiXin) {
            wx.onShow((res: { scene, query, shareTicket: string }) => {
                if (this._musicUrl != null)
                    this.playMusic(this._musicUrl);
            });
        }
    }

    private static _musicUrl: string;
    public static playMusic(url: string) {
        if (this.isMuted() || url == null)
            return;

        this._musicUrl = url;
        // 2.0 playMusic接口在微信真机上会报错
        // Laya.SoundManager.playMusic(url);
        this.playSound(url);
    }

    public static playMusicRandom(urls: string[]) {
        if (this.isMuted())
            return;

        let index = Math.floor(Math.random() * urls.length);

        let url = urls[index];
        this.playMusic(url);
    }

    public static playSound(url: string, loop: number = 1) {
        if (Laya.SoundManager.muted)
            return;

        // 微信上使用SoundManager.playSound播放同一个音效会出现repeat load的警告，改成用微信自带的接口
        if (Laya.Browser.onWeiXin) {
            let audio = this.caches[url]
            if (audio == null) {
                audio = wx.createInnerAudioContext();
                audio.src = url;
                audio.loop = loop == 0;
                this.caches[url] = audio;
            }
            audio.play();
        } else {
            Laya.SoundManager.playSound(url, loop);
        }
    }

    public static isMuted(): boolean {
        return Laya.SoundManager.muted
    }

    private static originMuted: boolean;
    public static tempSetMuted(isMuted: boolean) {
        this.originMuted = this.isMuted();
        this.setMuted(isMuted);
    }

    public static revertMutedState() {
        this.setMuted(this.originMuted);
    }

    public static setMuted(isMute: boolean) {
        let oldMutedV = Laya.SoundManager.muted;
        Laya.SoundManager.muted = isMute;

        if (oldMutedV && !isMute) {
            this.playMusic(this._musicUrl);
        }

        Laya.LocalStorage.setItem("audio", isMute && "1" || "0");
    }

    public static
}
