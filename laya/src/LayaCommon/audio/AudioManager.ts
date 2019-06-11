// import ConfigManager from "../../game/manager/ConfigManager";
import Resource from "../resource/Resource";

export default class AudioManager {
    private static caches: { [url: string]: any } = {};
    
    private static _musicUrl: string;
    private static _music:any;
    private static _musicVolume:number;

    private static originMuted: boolean;

    /**
     * 初始化
     */
    public static setup() {
        let audioV = Laya.LocalStorage.getItem("audio");
        Laya.SoundManager.muted = audioV == "1";

        if (Laya.Browser.onWeiXin) {
            wx.onShow((res: { scene, query, shareTicket: string }) => {
                if (this._musicUrl != null)
                    this.playMusic(this._musicUrl, this._musicVolume);
            });
        }
    }


    /**
     * 播放音乐，一般用于背景音乐
     * @param url 音乐资源路径
     * @param volume 音量，0-100
     */
    public static playMusic(url: string, volume:number=100) {
        if (this.isMuted() || url == null)
            return;
        
        if (this._music){
            this._music.stop();
        }

        this._musicUrl = url;
        this._musicVolume = volume;
        // 2.0 playMusic接口在微信真机上会报错
        // Laya.SoundManager.playMusic(url);
        this._music = this.playSound(url, volume, 0);
    }

    /**
     * 随机播放背景音乐
     * @param urls 资源列表
     * @param volume 音量，0-100
     */
    public static playMusicRandom(urls: string[], volume:number=100) {
        if (this.isMuted())
            return;

        let index = Math.floor(Math.random() * urls.length);

        let url = urls[index];
        this.playMusic(url, volume);
    }

    // /**
    //  * 根据配置表播放声音
    //  * @param id 
    //  * @param {number} 循环次数，0表示无限循环，默认为1
    //  */
    // public static playConfig(id, loop: number = 1): Laya.SoundChannel | null{
    //     if (Laya.SoundManager.muted)
    //         return null;
    //     let config = ConfigManager.voice[id];
    //     return this.playSound(Resource.voiceUrl(config.res), config.volume, loop);
    // }

    /**
     * 播放音效
     * @param url 资源路径
     * @param volume 音量， 0-100
     * @param loop 循环次数，0：循环，n：循环n次
     */
    public static playSound(url: string, volume:number=100, loop: number = 1): Laya.SoundChannel | null {
        if (Laya.SoundManager.muted)
            return null;

        // 微信上使用SoundManager.playSound播放同一个音效会出现repeat load的警告，改成用微信自带的接口
        // if (Laya.Browser.onWeiXin) {
        //     let audio = this.caches[url]
        //     if (audio == null) {
        //         audio = wx.createInnerAudioContext();
        //         audio.src = url;
        //         audio.loop = loop == 0;
        //         this.caches[url] = audio;
        //     }
        //     audio.volume = volume/100;
        //     audio.play();
        //     return audio;
        // } else {
            let channel = Laya.SoundManager.playSound(url, loop);
            if (channel){
                channel.volume = volume/100;
            }
            return channel;
        // }
    }

    /**
     * 是否静音
     */
    public static isMuted(): boolean {
        return Laya.SoundManager.muted
    }

    /**
     * 临时设置静音，与reverMutedState对应
     * @param isMuted 是否静音
     */
    public static tempSetMuted(isMuted: boolean) {
        this.originMuted = this.isMuted();
        this.setMuted(isMuted);
    }

    /**
     * 还原静音设置，与tempSetMuted对应
     */
    public static revertMutedState() {
        this.setMuted(this.originMuted);
    }

    /**
     * 设置是否静音
     * @param isMute 静音
     */
    public static setMuted(isMute: boolean) {
        let oldMutedV = Laya.SoundManager.muted;
        Laya.SoundManager.muted = isMute;

        if (oldMutedV && !isMute) {
            this.playMusic(this._musicUrl);
        }

        Laya.LocalStorage.setItem("audio", isMute && "1" || "0");
    }
}
