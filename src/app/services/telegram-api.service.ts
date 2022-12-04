import { Injectable } from "@angular/core";
import { CacheService } from "./cache.service";

const MTProto = require('@mtproto/core/envs/browser')

export const telegramConfig = {
    api_id: 20269554,
    api_hash: "79ee221e9af434956b313a91f3d30380"
}

@Injectable({
    providedIn: 'root'
})
export class TelegramApi {

    mtProto: any;

    constructor(
        private cache: CacheService
    ) {
        this.mtProto = new MTProto({
            api_id: telegramConfig.api_id,
            api_hash: telegramConfig.api_hash,
            test: false
        })
    }
    async call(method, params = {}, options = {}, nocache = false) {

        let params_str = JSON.stringify(params);
        let cache_tag = method + '_' + params_str;
        let cached = this.cache.getObj(cache_tag);

        if (cached && !nocache) {
            console.log('got cached', cached);
            return Promise.resolve(cached);
        } else {

            try {
                const result = await this.mtProto.call(method, params, options);
                this.cache.saveObj(cache_tag, result);
                return result;
            } catch (error) {
                console.log(`${method} error:`, error);

                const { error_code, error_message } = error;

                if (error_code === 420) {
                    const seconds = Number(error_message.split('FLOOD_WAIT_')[1]);
                    const ms = seconds * 1000;
                    alert('flood wait: ' + seconds)
                    setTimeout(() => {
                        return this.call(method, params, options);
                    }, ms)
                }

                if (error_code === 303) {
                    const [type, dcIdAsString] = error_message.split('_MIGRATE_');

                    const dcId = Number(dcIdAsString);

                    // If auth.sendCode call on incorrect DC need change default DC, because
                    // call auth.signIn on incorrect DC return PHONE_CODE_EXPIRED error
                    if (type === 'PHONE') {
                        await this.mtProto.setDefaultDc(dcId);
                    } else {
                        Object.assign(options, { dcId });
                    }

                    return this.call(method, params, options);
                }

                return Promise.reject(error);
            }
        }
    }

    sendCode(phone) {
        return this.call('auth.sendCode', {
            phone_number: phone,
            settings: {
                _: 'codeSettings'
            }
        })
    }

    signIn(phone_code, phone_number, phone_code_hash) {
        return this.call('auth.signIn', {
            phone_code,
            phone_number,
            phone_code_hash
        })
    }


    // MFA
    getPassword() {
        return this.mtProto.call('account.getPassword');
    }

    checkPassword({ srp_id, A, M1 }) {
        return this.mtProto.call('auth.checkPassword', {
            password: {
                _: 'inputCheckPasswordSRP',
                srp_id,
                A,
                M1,
            },
        });
    }


}