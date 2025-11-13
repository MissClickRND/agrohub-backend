import {Injectable, HttpException, HttpStatus} from '@nestjs/common';
import axios, {AxiosRequestHeaders} from 'axios';
import {Request} from 'express';
import {ConfigService} from '@nestjs/config';

@Injectable()
export class ProxyService {
    private readonly routes: any;

    constructor(private configService: ConfigService) {
        this.routes = {
            auth: this.configService.get<string>('AGROHUB_AUTH_PROXY')!,
            fields: this.configService.get<string>('AGROHUB_FIELDS_PROXY')!,
            recommendation: this.configService.get<string>('AGROHUB_RECOMMENDATION_PROXY')!,
            culture: this.configService.get<string>('AGROHUB_CULTURE_PROXY')!,
            ground: this.configService.get<string>('AGROHUB_GROUND_PROXY')!,
            dashboard: this.configService.get<string>('AGROHUB_DASHBOARD_PROXY')!,
            organization: this.configService.get<string>('AGROHUB_ORGANIZATION_PROXY')!,
            calculator: this.configService.get<string>('AGROHUB_CALCULATOR_PROXY')!,
            gpt: this.configService.get<string>('AGROHUB_GPT_PROXY')!,
        };
    }

    async forwardRequest(req: Request, target: string) {
        console.log(target);

        const baseUrl = this.routes[target];
        if (!baseUrl) {
            throw new HttpException(
                `Unknown service: ${target}`,
                HttpStatus.BAD_GATEWAY,
            );
        }

        const url = `${baseUrl}${req.path}`;
        const method = req.method as keyof typeof axios;

        //@ts-ignore
        const headers: AxiosRequestHeaders = {
            ...req.headers,
            'x-user-id': req.headers['x-user-id'] as string,
            'x-username': req.headers['x-username'] as string,
            'x-email': req.headers['x-email'] as string,
        };

        delete headers['content-length'];
        delete headers['host'];

        try {
            const response = await axios.request({
                method: method,
                url: url,
                headers: headers,
                data: req.body,
            });

            return response.data;
        } catch (err: any) {
            console.log('ERROR:', err);

            throw new HttpException(
                err.response?.data || 'Proxy request failed',
                err.response?.status || HttpStatus.BAD_GATEWAY,
            );
        }
    }
}
