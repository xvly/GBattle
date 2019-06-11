// import { AppInfo } from "../../game/common/CommonPlatform";

// export default class ViewVersion{
//     private static root:Laya.Panel;
//     public static show(){
//         if (this.root){
//             return;
//         }

//         this.root = new Laya.Panel();
//         this.root.zOrder = 999;
//         this.root.left = 0;
//         this.root.right = 0;
//         this.root.top = 0;
//         this.root.bottom = 0;
//         Laya.stage.addChild(this.root);
//         let label = new Laya.Label(AppInfo.GameVersion);
//         label.fontSize = 24;
//         label.left = 0;
//         label.bottom = 0;
//         this.root.addChild(label);
//     }

//     public static hide(){
//         if (this.root){
//             this.root.destroy();
//             this.root = null;
//         }
//     }
// }