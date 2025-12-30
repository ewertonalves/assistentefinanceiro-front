import { useState, useCallback } from 'react';
import { aiService } from '@/services/ai.service';
import { toast } from 'react-toastify';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const useAiChat = (contaId?: number) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (prompt: string) => {
      if (!prompt.trim()) return;

      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: prompt,
        timestamp: new Date(),
      };
      setMessages((prev: Message[]) => [...prev, userMessage]);
      setIsLoading(true);
      setError(null);

      try {
        const historico = messages
          .slice(-10)
          .map((m: Message) => `${m.role === 'user' ? 'Usuário' : 'IA'}: ${m.content}`);

        console.log('[useAiChat] Enviando mensagem', { prompt, historico: historico.length, contaId });
        
        const response = contaId
          ? await aiService.manterConversacao(prompt, historico, contaId)
          : await aiService.manterConversacao(prompt, historico);

        console.log('[useAiChat] Resposta recebida', { responseLength: response?.length, responsePreview: response?.substring(0, 100) });

        if (!response || response.trim() === '') {
          throw new Error('Resposta vazia recebida da IA');
        }

        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response,
          timestamp: new Date(),
        };
        setMessages((prev: Message[]) => [...prev, aiMessage]);
      } catch (err: any) {
        console.error('[useAiChat] Erro ao processar mensagem', err);
        const errorMsg =
          err.response?.data?.mensagem || err.message || 'Erro ao processar sua pergunta';
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, contaId]
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearChat,
  };
};

