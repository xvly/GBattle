// import { SceneSize, SceneGridType } from "../../../game/common/CommonScene";

// export interface AStarPos{
//     x:number;
//     y:number;
// }
    
// export default class AStar{
//     private static astar:EasyStar.js;
//     private static grids:number[][];
//     private static acceptableTiles:number[];

//     /**
//      * 初始化
//      * @param isEnableDiagonals 是否可以走斜线
//      */
//     public static setup(isEnableDiagonals:boolean, acceptableTiles:number[]){
//         this.acceptableTiles = acceptableTiles;

//         this.astar = new EasyStar.js();
//         if (isEnableDiagonals){
//             this.astar.enableDiagonals();
//         }
//         this.astar.enableSync();
//         this.astar.setAcceptableTiles(acceptableTiles);
//     }

//     /**
//      * 配置
//      */
//     public static setGrids(grids:number[][]){
//         this.grids = grids;
//         this.astar.setGrid(grids);
//     }

//     public static getGridType(x:number,y:number){
//         try{
//             return this.grids[y][x];
//         } catch(err){
//             console.error(x + "," +y + ":"+err);
//         }
        
//     }

//     public static isGridWalkable(x:number, y:number){
//         if (x < 0 || x>=SceneSize.width || y<0 || y>=SceneSize.height){
//             return false;
//         }

//         let gridType = this.getGridType(x, y);
//         for (let type of this.acceptableTiles){
//             if (type == gridType){
//                 return true;
//             }
//         }
//         return false;
//     }

//     public static isGridBlock(x:number, y:number){
//         return !this.isGridWalkable(x, y);
//     }

//     /**
//      * 一维数组转换为二维数组
//      * @param map 
//      * @param col 
//      * @param row 
//      */
//     public static transfer(map:number[], col:number, row:number){
//         let grids:number[][] = [];
//         for (let r=0; r<row; r++){
//             let line = [];
//             for (let c=0; c<col; c++){
//                 line.push(map[r*col+c]);
//             }
//             grids.push(line);
//         }
//         return grids;
//     }

//     /**
//      * 寻路
//      * @param startX 
//      * @param startY 
//      * @param endX 
//      * @param endY 
//      * @param callback 
//      * @returns 路径ID
//      */
//     public static findPath(
//         startX:number,startY:number, 
//         endX:number, endY:number, 
//         callback:(points:AStarPos[])=>void):number{

//         if (startX < 0){
//             startX = 0;
//         } else if (startX >= SceneSize.width){
//             startX = SceneSize.width-1;
//         }

//         if (startY < 0){
//             startY = 0;
//         } else if (startY >= SceneSize.height){
//             startY = SceneSize.height-1;
//         }

//         if (endX < 0){
//             endX = 0;
//         } else if (endX >= SceneSize.width){
//             endX = SceneSize.width-1;
//         }

//         if (endY < 0){
//             endY = 0;
//         } else if (endY >= SceneSize.height){
//             endY = SceneSize.height-1;
//         }

//         return this.astar.findPath(startX, startY, endX, endY, callback);
//     }

//     /**
//      * 执行寻路
//      */
//     public static calculate(){
//         this.astar.calculate();
//     }
    
//     /**
//      * 寻路并执行
//      * @param startX 
//      * @param startY 
//      * @param endX 
//      * @param endY 
//      */
//     public static async pathTo(
//         startX:number, startY:number, 
//         endX:number, endY:number):Promise<AStarPos[]>{
//         return new Promise((resolve:(points:AStarPos[])=>void) => {
//             this.findPath(
//                 startX, startY, 
//                 endX, endY, 
//                 function(points){
//                     resolve(points);
//                 });
//             this.astar.calculate();
//         });
//     }

//     public static pathToAtOnce(
//         startX:number, startY:number, 
//         endX:number, endY:number):AStarPos[]{
//             this.findPath(
//                 startX, startY, 
//                 endX, endY, null);
//             return this.astar.calculateAtOnce();
//     }

//     /**
//      * 取消寻路
//      * @param id 
//      */
//     public static cacelPath(id:number){
//         this.astar.cancelPath(id);
//     }
// }