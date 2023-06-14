//----------------------
// <auto-generated>
//     Generated using the NSwag toolchain v13.19.0.0 (NJsonSchema v10.9.0.0 (Newtonsoft.Json v13.0.0.0)) (http://NSwag.org)
// </auto-generated>
//----------------------

/* tslint:disable */
/* eslint-disable */
// ReSharper disable InconsistentNaming

import axios, { AxiosError } from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, CancelToken } from 'axios';

export class AppControllerClient {
    private instance: AxiosInstance;
    private baseUrl: string;
    protected jsonParseReviver: ((key: string, value: any) => any) | undefined = undefined;

    constructor(baseUrl?: string, instance?: AxiosInstance) {

        this.instance = instance ? instance : axios.create();

        this.baseUrl = baseUrl !== undefined && baseUrl !== null ? baseUrl : "";

    }

    getLastFiddleById(id: string, cancelToken?: CancelToken | undefined): Promise<FiddleResponseDto> {
        let url_ = this.baseUrl + "/fiddles/{id}";
        if (id === undefined || id === null)
            throw new Error("The parameter 'id' must be defined.");
        url_ = url_.replace("{id}", encodeURIComponent("" + id));
        url_ = url_.replace(/[?&]$/, "");

        let options_: AxiosRequestConfig = {
            method: "GET",
            url: url_,
            headers: {
                "Accept": "application/json"
            },
            cancelToken
        };

        return this.instance.request(options_).catch((_error: any) => {
            if (isAxiosError(_error) && _error.response) {
                return _error.response;
            } else {
                throw _error;
            }
        }).then((_response: AxiosResponse) => {
            return this.processGetLastFiddleById(_response);
        });
    }

    protected processGetLastFiddleById(response: AxiosResponse): Promise<FiddleResponseDto> {
        const status = response.status;
        let _headers: any = {};
        if (response.headers && typeof response.headers === "object") {
            for (let k in response.headers) {
                if (response.headers.hasOwnProperty(k)) {
                    _headers[k] = response.headers[k];
                }
            }
        }
        if (status === 200) {
            const _responseText = response.data;
            let result200: any = null;
            let resultData200  = _responseText;
            result200 = FiddleResponseDto.fromJS(resultData200);
            return Promise.resolve<FiddleResponseDto>(result200);

        } else if (status !== 200 && status !== 204) {
            const _responseText = response.data;
            return throwException("An unexpected server error occurred.", status, _responseText, _headers);
        }
        return Promise.resolve<FiddleResponseDto>(null as any);
    }

    updateFiddle(id: string, body: UpdateFiddleDto, cancelToken?: CancelToken | undefined): Promise<FiddleResponseWithTokenDto> {
        let url_ = this.baseUrl + "/fiddles/{id}";
        if (id === undefined || id === null)
            throw new Error("The parameter 'id' must be defined.");
        url_ = url_.replace("{id}", encodeURIComponent("" + id));
        url_ = url_.replace(/[?&]$/, "");

        const content_ = JSON.stringify(body);

        let options_: AxiosRequestConfig = {
            data: content_,
            method: "PATCH",
            url: url_,
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            cancelToken
        };

        return this.instance.request(options_).catch((_error: any) => {
            if (isAxiosError(_error) && _error.response) {
                return _error.response;
            } else {
                throw _error;
            }
        }).then((_response: AxiosResponse) => {
            return this.processUpdateFiddle(_response);
        });
    }

    protected processUpdateFiddle(response: AxiosResponse): Promise<FiddleResponseWithTokenDto> {
        const status = response.status;
        let _headers: any = {};
        if (response.headers && typeof response.headers === "object") {
            for (let k in response.headers) {
                if (response.headers.hasOwnProperty(k)) {
                    _headers[k] = response.headers[k];
                }
            }
        }
        if (status === 200) {
            const _responseText = response.data;
            let result200: any = null;
            let resultData200  = _responseText;
            result200 = FiddleResponseWithTokenDto.fromJS(resultData200);
            return Promise.resolve<FiddleResponseWithTokenDto>(result200);

        } else if (status !== 200 && status !== 204) {
            const _responseText = response.data;
            return throwException("An unexpected server error occurred.", status, _responseText, _headers);
        }
        return Promise.resolve<FiddleResponseWithTokenDto>(null as any);
    }

    getRecentFiddlesByIds(body: RecentFiddlesDto, cancelToken?: CancelToken | undefined): Promise<FiddleResponseDto[]> {
        let url_ = this.baseUrl + "/recent-fiddles";
        url_ = url_.replace(/[?&]$/, "");

        const content_ = JSON.stringify(body);

        let options_: AxiosRequestConfig = {
            data: content_,
            method: "PATCH",
            url: url_,
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            cancelToken
        };

        return this.instance.request(options_).catch((_error: any) => {
            if (isAxiosError(_error) && _error.response) {
                return _error.response;
            } else {
                throw _error;
            }
        }).then((_response: AxiosResponse) => {
            return this.processGetRecentFiddlesByIds(_response);
        });
    }

    protected processGetRecentFiddlesByIds(response: AxiosResponse): Promise<FiddleResponseDto[]> {
        const status = response.status;
        let _headers: any = {};
        if (response.headers && typeof response.headers === "object") {
            for (let k in response.headers) {
                if (response.headers.hasOwnProperty(k)) {
                    _headers[k] = response.headers[k];
                }
            }
        }
        if (status === 200) {
            const _responseText = response.data;
            let result200: any = null;
            let resultData200  = _responseText;
            if (Array.isArray(resultData200)) {
                result200 = [] as any;
                for (let item of resultData200)
                    result200!.push(FiddleResponseDto.fromJS(item));
            }
            else {
                result200 = <any>null;
            }
            return Promise.resolve<FiddleResponseDto[]>(result200);

        } else if (status !== 200 && status !== 204) {
            const _responseText = response.data;
            return throwException("An unexpected server error occurred.", status, _responseText, _headers);
        }
        return Promise.resolve<FiddleResponseDto[]>(null as any);
    }

    getFiddleByIdAndVersion(id: string, version: string, cancelToken?: CancelToken | undefined): Promise<FiddleResponseDto> {
        let url_ = this.baseUrl + "/fiddles/{id}/{version}";
        if (id === undefined || id === null)
            throw new Error("The parameter 'id' must be defined.");
        url_ = url_.replace("{id}", encodeURIComponent("" + id));
        if (version === undefined || version === null)
            throw new Error("The parameter 'version' must be defined.");
        url_ = url_.replace("{version}", encodeURIComponent("" + version));
        url_ = url_.replace(/[?&]$/, "");

        let options_: AxiosRequestConfig = {
            method: "GET",
            url: url_,
            headers: {
                "Accept": "application/json"
            },
            cancelToken
        };

        return this.instance.request(options_).catch((_error: any) => {
            if (isAxiosError(_error) && _error.response) {
                return _error.response;
            } else {
                throw _error;
            }
        }).then((_response: AxiosResponse) => {
            return this.processGetFiddleByIdAndVersion(_response);
        });
    }

    protected processGetFiddleByIdAndVersion(response: AxiosResponse): Promise<FiddleResponseDto> {
        const status = response.status;
        let _headers: any = {};
        if (response.headers && typeof response.headers === "object") {
            for (let k in response.headers) {
                if (response.headers.hasOwnProperty(k)) {
                    _headers[k] = response.headers[k];
                }
            }
        }
        if (status === 200) {
            const _responseText = response.data;
            let result200: any = null;
            let resultData200  = _responseText;
            result200 = FiddleResponseDto.fromJS(resultData200);
            return Promise.resolve<FiddleResponseDto>(result200);

        } else if (status !== 200 && status !== 204) {
            const _responseText = response.data;
            return throwException("An unexpected server error occurred.", status, _responseText, _headers);
        }
        return Promise.resolve<FiddleResponseDto>(null as any);
    }

    createFiddle(body: CreateFiddleDto, cancelToken?: CancelToken | undefined): Promise<FiddleResponseWithTokenDto> {
        let url_ = this.baseUrl + "/fiddles";
        url_ = url_.replace(/[?&]$/, "");

        const content_ = JSON.stringify(body);

        let options_: AxiosRequestConfig = {
            data: content_,
            method: "POST",
            url: url_,
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            cancelToken
        };

        return this.instance.request(options_).catch((_error: any) => {
            if (isAxiosError(_error) && _error.response) {
                return _error.response;
            } else {
                throw _error;
            }
        }).then((_response: AxiosResponse) => {
            return this.processCreateFiddle(_response);
        });
    }

    protected processCreateFiddle(response: AxiosResponse): Promise<FiddleResponseWithTokenDto> {
        const status = response.status;
        let _headers: any = {};
        if (response.headers && typeof response.headers === "object") {
            for (let k in response.headers) {
                if (response.headers.hasOwnProperty(k)) {
                    _headers[k] = response.headers[k];
                }
            }
        }
        if (status === 201) {
            const _responseText = response.data;
            let result201: any = null;
            let resultData201  = _responseText;
            result201 = FiddleResponseWithTokenDto.fromJS(resultData201);
            return Promise.resolve<FiddleResponseWithTokenDto>(result201);

        } else if (status !== 200 && status !== 204) {
            const _responseText = response.data;
            return throwException("An unexpected server error occurred.", status, _responseText, _headers);
        }
        return Promise.resolve<FiddleResponseWithTokenDto>(null as any);
    }

    checkToken(id: string, body: CheckFiddleDto, cancelToken?: CancelToken | undefined): Promise<FiddleResponseWithTokenDto> {
        let url_ = this.baseUrl + "/fiddles/{id}/check";
        if (id === undefined || id === null)
            throw new Error("The parameter 'id' must be defined.");
        url_ = url_.replace("{id}", encodeURIComponent("" + id));
        url_ = url_.replace(/[?&]$/, "");

        const content_ = JSON.stringify(body);

        let options_: AxiosRequestConfig = {
            data: content_,
            method: "PATCH",
            url: url_,
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            cancelToken
        };

        return this.instance.request(options_).catch((_error: any) => {
            if (isAxiosError(_error) && _error.response) {
                return _error.response;
            } else {
                throw _error;
            }
        }).then((_response: AxiosResponse) => {
            return this.processCheckToken(_response);
        });
    }

    protected processCheckToken(response: AxiosResponse): Promise<FiddleResponseWithTokenDto> {
        const status = response.status;
        let _headers: any = {};
        if (response.headers && typeof response.headers === "object") {
            for (let k in response.headers) {
                if (response.headers.hasOwnProperty(k)) {
                    _headers[k] = response.headers[k];
                }
            }
        }
        if (status === 200) {
            const _responseText = response.data;
            let result200: any = null;
            let resultData200  = _responseText;
            result200 = FiddleResponseWithTokenDto.fromJS(resultData200);
            return Promise.resolve<FiddleResponseWithTokenDto>(result200);

        } else if (status !== 200 && status !== 204) {
            const _responseText = response.data;
            return throwException("An unexpected server error occurred.", status, _responseText, _headers);
        }
        return Promise.resolve<FiddleResponseWithTokenDto>(null as any);
    }

    forkFiddleVersion(id: string, version: string, cancelToken?: CancelToken | undefined): Promise<FiddleResponseWithTokenDto> {
        let url_ = this.baseUrl + "/fiddles/{id}/{version}/fork";
        if (id === undefined || id === null)
            throw new Error("The parameter 'id' must be defined.");
        url_ = url_.replace("{id}", encodeURIComponent("" + id));
        if (version === undefined || version === null)
            throw new Error("The parameter 'version' must be defined.");
        url_ = url_.replace("{version}", encodeURIComponent("" + version));
        url_ = url_.replace(/[?&]$/, "");

        let options_: AxiosRequestConfig = {
            method: "POST",
            url: url_,
            headers: {
                "Accept": "application/json"
            },
            cancelToken
        };

        return this.instance.request(options_).catch((_error: any) => {
            if (isAxiosError(_error) && _error.response) {
                return _error.response;
            } else {
                throw _error;
            }
        }).then((_response: AxiosResponse) => {
            return this.processForkFiddleVersion(_response);
        });
    }

    protected processForkFiddleVersion(response: AxiosResponse): Promise<FiddleResponseWithTokenDto> {
        const status = response.status;
        let _headers: any = {};
        if (response.headers && typeof response.headers === "object") {
            for (let k in response.headers) {
                if (response.headers.hasOwnProperty(k)) {
                    _headers[k] = response.headers[k];
                }
            }
        }
        if (status === 201) {
            const _responseText = response.data;
            let result201: any = null;
            let resultData201  = _responseText;
            result201 = FiddleResponseWithTokenDto.fromJS(resultData201);
            return Promise.resolve<FiddleResponseWithTokenDto>(result201);

        } else if (status !== 200 && status !== 204) {
            const _responseText = response.data;
            return throwException("An unexpected server error occurred.", status, _responseText, _headers);
        }
        return Promise.resolve<FiddleResponseWithTokenDto>(null as any);
    }

    forkFiddle(id: string, cancelToken?: CancelToken | undefined): Promise<FiddleResponseWithTokenDto> {
        let url_ = this.baseUrl + "/fiddles/{id}/fork";
        if (id === undefined || id === null)
            throw new Error("The parameter 'id' must be defined.");
        url_ = url_.replace("{id}", encodeURIComponent("" + id));
        url_ = url_.replace(/[?&]$/, "");

        let options_: AxiosRequestConfig = {
            method: "POST",
            url: url_,
            headers: {
                "Accept": "application/json"
            },
            cancelToken
        };

        return this.instance.request(options_).catch((_error: any) => {
            if (isAxiosError(_error) && _error.response) {
                return _error.response;
            } else {
                throw _error;
            }
        }).then((_response: AxiosResponse) => {
            return this.processForkFiddle(_response);
        });
    }

    protected processForkFiddle(response: AxiosResponse): Promise<FiddleResponseWithTokenDto> {
        const status = response.status;
        let _headers: any = {};
        if (response.headers && typeof response.headers === "object") {
            for (let k in response.headers) {
                if (response.headers.hasOwnProperty(k)) {
                    _headers[k] = response.headers[k];
                }
            }
        }
        if (status === 201) {
            const _responseText = response.data;
            let result201: any = null;
            let resultData201  = _responseText;
            result201 = FiddleResponseWithTokenDto.fromJS(resultData201);
            return Promise.resolve<FiddleResponseWithTokenDto>(result201);

        } else if (status !== 200 && status !== 204) {
            const _responseText = response.data;
            return throwException("An unexpected server error occurred.", status, _responseText, _headers);
        }
        return Promise.resolve<FiddleResponseWithTokenDto>(null as any);
    }
}

export class FiddleResponseDto implements IFiddleResponseDto {
    id!: string;
    version!: number;
    code!: string;
    createdAt!: number;
    updatedAt!: number;

    constructor(data?: IFiddleResponseDto) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (<any>this)[property] = (<any>data)[property];
            }
        }
    }

    init(_data?: any) {
        if (_data) {
            this.id = _data["id"];
            this.version = _data["version"];
            this.code = _data["code"];
            this.createdAt = _data["createdAt"];
            this.updatedAt = _data["updatedAt"];
        }
    }

    static fromJS(data: any): FiddleResponseDto {
        data = typeof data === 'object' ? data : {};
        let result = new FiddleResponseDto();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["id"] = this.id;
        data["version"] = this.version;
        data["code"] = this.code;
        data["createdAt"] = this.createdAt;
        data["updatedAt"] = this.updatedAt;
        return data;
    }
}

export interface IFiddleResponseDto {
    id: string;
    version: number;
    code: string;
    createdAt: number;
    updatedAt: number;
}

export class RecentFiddlesDto implements IRecentFiddlesDto {
    ids!: string;

    constructor(data?: IRecentFiddlesDto) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (<any>this)[property] = (<any>data)[property];
            }
        }
    }

    init(_data?: any) {
        if (_data) {
            this.ids = _data["ids"];
        }
    }

    static fromJS(data: any): RecentFiddlesDto {
        data = typeof data === 'object' ? data : {};
        let result = new RecentFiddlesDto();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["ids"] = this.ids;
        return data;
    }
}

export interface IRecentFiddlesDto {
    ids: string;
}

export class CreateFiddleDto implements ICreateFiddleDto {
    code!: string;

    constructor(data?: ICreateFiddleDto) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (<any>this)[property] = (<any>data)[property];
            }
        }
    }

    init(_data?: any) {
        if (_data) {
            this.code = _data["code"];
        }
    }

    static fromJS(data: any): CreateFiddleDto {
        data = typeof data === 'object' ? data : {};
        let result = new CreateFiddleDto();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["code"] = this.code;
        return data;
    }
}

export interface ICreateFiddleDto {
    code: string;
}

export class FiddleResponseWithTokenDto implements IFiddleResponseWithTokenDto {
    token!: string;
    id!: string;
    version!: number;
    code!: string;
    createdAt!: number;
    updatedAt!: number;

    constructor(data?: IFiddleResponseWithTokenDto) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (<any>this)[property] = (<any>data)[property];
            }
        }
    }

    init(_data?: any) {
        if (_data) {
            this.token = _data["token"];
            this.id = _data["id"];
            this.version = _data["version"];
            this.code = _data["code"];
            this.createdAt = _data["createdAt"];
            this.updatedAt = _data["updatedAt"];
        }
    }

    static fromJS(data: any): FiddleResponseWithTokenDto {
        data = typeof data === 'object' ? data : {};
        let result = new FiddleResponseWithTokenDto();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["token"] = this.token;
        data["id"] = this.id;
        data["version"] = this.version;
        data["code"] = this.code;
        data["createdAt"] = this.createdAt;
        data["updatedAt"] = this.updatedAt;
        return data;
    }
}

export interface IFiddleResponseWithTokenDto {
    token: string;
    id: string;
    version: number;
    code: string;
    createdAt: number;
    updatedAt: number;
}

export class CheckFiddleDto implements ICheckFiddleDto {
    token!: string;

    constructor(data?: ICheckFiddleDto) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (<any>this)[property] = (<any>data)[property];
            }
        }
    }

    init(_data?: any) {
        if (_data) {
            this.token = _data["token"];
        }
    }

    static fromJS(data: any): CheckFiddleDto {
        data = typeof data === 'object' ? data : {};
        let result = new CheckFiddleDto();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["token"] = this.token;
        return data;
    }
}

export interface ICheckFiddleDto {
    token: string;
}

export class UpdateFiddleDto implements IUpdateFiddleDto {
    code!: string;
    token!: string;

    constructor(data?: IUpdateFiddleDto) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (<any>this)[property] = (<any>data)[property];
            }
        }
    }

    init(_data?: any) {
        if (_data) {
            this.code = _data["code"];
            this.token = _data["token"];
        }
    }

    static fromJS(data: any): UpdateFiddleDto {
        data = typeof data === 'object' ? data : {};
        let result = new UpdateFiddleDto();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["code"] = this.code;
        data["token"] = this.token;
        return data;
    }
}

export interface IUpdateFiddleDto {
    code: string;
    token: string;
}

export class ApiException extends Error {
    message: string;
    status: number;
    response: string;
    headers: { [key: string]: any; };
    result: any;

    constructor(message: string, status: number, response: string, headers: { [key: string]: any; }, result: any) {
        super();

        this.message = message;
        this.status = status;
        this.response = response;
        this.headers = headers;
        this.result = result;
    }

    protected isApiException = true;

    static isApiException(obj: any): obj is ApiException {
        return obj.isApiException === true;
    }
}

function throwException(message: string, status: number, response: string, headers: { [key: string]: any; }, result?: any): any {
    if (result !== null && result !== undefined)
        throw result;
    else
        throw new ApiException(message, status, response, headers, null);
}

function isAxiosError(obj: any | undefined): obj is AxiosError {
    return obj && obj.isAxiosError === true;
}