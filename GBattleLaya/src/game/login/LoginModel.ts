export interface LoginData{
    id: string;
    nid: number[];
    expiresAt: string;
    jwt: string;
}

export default class LoginModel{
    public data:LoginData;
}