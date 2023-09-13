import axios from 'axios';
import axiosRetry from 'axios-retry';
import cron from 'node-cron';
import { v4 as uuidv4 } from 'uuid';

axiosRetry(axios, {
    retries: 3,
    retryDelay: (retryCount) => {
        console.warn(`Houve um erro ao registrar o ponto, tentando novamente: Tentativa número ${retryCount}`);
        return retryCount * 15000;
    },
});

function ensureEnv(envName) {
    if (!Bun.env[envName]) {
        throw new Error(`É necessário definir a variável de ambiente ${envName}`);
    }
}

ensureEnv("EMAIL");
ensureEnv("PASSWORD");
ensureEnv("LATITUDE");
ensureEnv("LONGITUDE");
ensureEnv("ADDRESS");
ensureEnv("IP_ADDRESS");



const headers = {
    "authority": "api.pontomais.com.br",
    "accept": "application/json, text/plain, */*",
    "accept-language": "pt-BR,pt;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
    "api-version": "2",
    "content-type": "application/json",
    "origin": "https://app2.pontomais.com.br",
    "referer": "https://app2.pontomais.com.br/",
    "reset": "true",
    "sec-ch-ua": '"Not/A)Brand";v="99", "Microsoft Edge";v="115", "Chromium";v="115"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"',
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-site",
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36 Edg/115.0.1901.188",
};

const pontoMaisApi = axios.create({
    baseURL: "https://api.pontomais.com.br/api",
});

async function signIn() {
    const payload = {
        login: Bun.env.EMAIL,
        password: Bun.env.PASSWORD,
    };

    const response = await pontoMaisApi.post("/auth/sign_in", payload, { headers });
    return response.data;
}

async function getAuthenticatedHeaders() {
    const signInResponse = await signIn();
    const sessionHeaders = {
        ...headers,
        "access-token": signInResponse.token,
        token: signInResponse.token,
        client: signInResponse.client_id,
        uid: signInResponse.data.login,
        uuid: uuidv4(),
    };

    return sessionHeaders;
}

async function getSession() {
    try {
        const sessionHeaders = await getAuthenticatedHeaders();
        const response = await pontoMaisApi.get("/session", { headers: sessionHeaders });
        return {
            sessionToken: response.data.session.employee.client.time_clocks_token,
            sessionHeaders
        };
    } catch (error) {
        if (error.response && error.response.data && error.response.data.path === '/auth/sign_in') {
            throw new Error("Não consegui fazer login no PontoMais. Erro: " + error);
        }
        throw new Error("Não consegui encontrar a sessão para o PontoMais. Erro: " + error);
    }
}

function makePayload({ token, clientId, uuid, login, sessionToken }) {
    return {
        "image": null,
        "employee": {
            "id": null,
            "pin": null,
        },
        "time_card": {
            "latitude": parseInt(BUN.env.LATITUDE),
            "longitude": parseInt(BUN.env.LONGITUDE),
            "address": Bun.env.ADDRESS,
            "original_latitude": null,
            "original_longitude": null,
            "original_address": null,
            "location_edited": true,
            "accuracy": 1100,
            "accuracy_method": null,
            "image": null,
            "info": null,
        },
        "_path": "/registrar-ponto",
        "_appVersion": "0.10.32",
        "_device": {
            "manufacturer": "null",
            "model": "null",
            "uuid": {
                "success": "Login efetuado com sucesso!",
                "token": token,
                "client_id": clientId,
                "data": {
                    "login": login,
                    "sign_in_count": 25,
                    "last_sign_in_ip": Bun.env.IP_ADDRESS,
                    "last_sign_in_at": Date.now(),
                },
                "uuid": uuid,
                "authorization": "Bearer " + sessionToken,
            },
            "version": "null",
        },
    };
}

async function registerTimeCard() {
    const { sessionHeaders, sessionToken } = await getSession();
    const payload = makePayload({
        token: sessionHeaders.token,
        sessionToken,
        clientId: sessionHeaders.client,
        uuid: sessionHeaders.uuid,
        login: sessionHeaders.uid,
    });

    try {
        const response = await pontoMaisApi.post("/time_cards/register", payload, {
            headers: { ...sessionHeaders }
        });
        console.log("Ponto registrado com sucesso às " + new Date().toLocaleString());
        return response.data;
    } catch (registerError) {
        throw new Error("Não consegui registrar o ponto no PontoMais. Erro: " + registerError);
    }
}

console.log("Iniciando o cronjob para registrar o ponto...");

cron.schedule('0 9,12,13,18 * * 1-5', registerTimeCard, {
    timezone: "America/Sao_Paulo"
});

console.log("Cronjob iniciado com sucesso!");
console.log("Aguardando o horário para registrar o ponto...");
