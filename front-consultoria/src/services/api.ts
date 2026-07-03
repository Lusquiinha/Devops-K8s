import { UUID } from 'crypto';
import { Question, Answer, User, UserType } from '../types';

class ApiService {
    private baseURL: string;
    private token: string | null;

    private onUnauthorized: (() => void) | null = null;

    constructor(baseURL: string = process.env.NEXT_PUBLIC_API_BASE_URL || '/api') {
        this.baseURL = baseURL;
        this.token = null;
    }
    
    public setToken(token: string | null): void {
        this.token = token;
    }

    public setOnUnauthorized(callback: () => void) {
        this.onUnauthorized = callback;
    }

    private getHeaders(): HeadersInit {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        return headers;
    }


    private async _fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            ...options,
            headers: this.getHeaders(),
        });

        const data = await response.json();

        if (!response.ok) {
            if(response.status === 401) {
                this.onUnauthorized?.();
            }
            const errorMessage = Array.isArray(data.message) ? data.message.join(', ') : (data.message || 'Ocorreu um erro.');
            throw new Error(errorMessage);
        }
        return data as T;
    }

    // --- Auth ---
    public login(email: string, senha: string): Promise<{ accessToken: string, refreshToken: string }> {
        return this._fetch<{ accessToken: string, refreshToken: string }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, "password": senha }),
        });
    }
    public register(nome: string, email: string, senha: string): Promise<User> {
        return this._fetch<User>('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ "name": nome, "email": email, "password": senha }),
        });
    }

    public refreshToken(refreshToken: string): Promise<{ access_token: string }> {
        return this._fetch<{ access_token: string }>('/auth/refresh', {
            method: 'POST',
            body: JSON.stringify({ refreshToken }),
        });
    }

    // --- Question ---
    public criarPergunta(textoPergunta: string, clienteId: string): Promise<Question> {
        return this._fetch<any>('/question', {
            method: 'POST',
            body: JSON.stringify({ "content": textoPergunta, "client": clienteId }),
        })
    }

    public async getPerguntasPendentes(): Promise<Question[]> {
        let data = await this._fetch<any[]>('/question/status/PENDING');
        data = await Promise.all(data.map(async (item: any) => ({
            ...item,
            client: item.clientId ?  await this.getUserById(item.clientId) : undefined,
            consultant: item.consultantId ? await this.getUserById(item.consultantId) : undefined,
        })));
        return data as Question[];
    }

    public async getPerguntasReivindicadas(consultorId: UUID | undefined): Promise<Question[]> {
        if (!consultorId) {
            throw new Error("Consultor ID is required to fetch claimed questions.");
        }
        let data = await this._fetch<any[]>(`/question/status/CLAIMED`);

        data = await Promise.all(data.map(async (item: any) => ({
            ...item,
            client: item.clientId ?  await this.getUserById(item.clientId) : undefined,
            consultant: item.consultantId ? await this.getUserById(item.consultantId) : undefined,
        })));
        return data as Question[];
    }

    public async getClientAndConsultant(question: Question): Promise<Question> {
        return {
            ...question,
            client: await this.getUserById(question.client?.id),
            consultant: question.consultant ? await this.getUserById(question.consultant.id) : undefined,
        }
    }

    public reivindicarPergunta(perguntaId: string, consultorId: string): Promise<Question> {
        return this._fetch<any>(`/question/claim/${perguntaId}`, {
            method: 'POST', 
        }).then(async (data) => {
            return {
                ...data,
                client: data.clientId ?  await this.getUserById(data.clientId) : undefined,
                consultant: data.consultantId ? await this.getUserById(data.consultantId) : undefined,
            } as Question;
        });
    }

    public async getHistorico(tipo: UserType, id: string): Promise<Question[]> {
        if (tipo === UserType.CLIENTE) {
            let questions = await this._fetch<any[]>(`/question/client`);
            questions = await Promise.all(questions.map(async (item: any) => ({
                ...item,
                client: item.clientId ?  await this.getUserById(item.clientId) : undefined,
                consultant: item.consultantId ? await this.getUserById(item.consultantId) : undefined,
            })));
            return questions;
        }
        if (tipo === UserType.CONSULTOR) {
            let data = await this._fetch<any[]>(`/question/status/ANSWERED`);

            data = await Promise.all(data.map(async (item: any) => ({
                ...item,
                client: item.clientId ?  await this.getUserById(item.clientId) : undefined,
                consultant: item.consultantId ? await this.getUserById(item.consultantId) : undefined,
            })));
            return data as Question[];
        }
        console.warn("A rota de histórico para consultor não está implementada no backend.");
        return Promise.resolve([]);
    }

    // --- User ---
    public getUserById(id: string): Promise<User> {
        return this._fetch<User>(`/user/${id}`);
    }

    // --- Resposta ---

    public enviarResposta(textoResposta: string, perguntaId: string, consultorId: string): Promise<Answer> {
        return this._fetch<Answer>('/answer', {
            method: 'POST',
            body: JSON.stringify({ "content": textoResposta, "question": perguntaId, "consultant": consultorId }),
        });
    }
}

export const apiService = new ApiService();