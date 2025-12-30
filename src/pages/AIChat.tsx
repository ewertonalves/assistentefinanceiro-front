import React, { useState, useEffect, useRef } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useAiChat } from '@/hooks/useAiChat';
import { accountsService } from '@/services/accounts.service';
import { Button } from '@/components/common/Button';
import { Select } from '@/components/common/Select';
import { PERGUNTAS_RAPIDAS_IA } from '@/utils/constants';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FiSend, FiX } from 'react-icons/fi';
import type { DadosContaDTO } from '@/types/account.types';

export const AIChat: React.FC = () => {
  const [contaId, setContaId] = useState<number | undefined>(undefined);
  const [contas, setContas] = useState<DadosContaDTO[]>([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, isLoading, error, sendMessage, clearChat } = useAiChat(contaId);

  useEffect(() => {
    loadContas();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadContas = async () => {
    try {
      const data = await accountsService.listarContas();
      setContas(data);
    } catch (error) {
      console.error('Erro ao carregar contas');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    const prompt = inputValue;
    setInputValue('');
    await sendMessage(prompt);
  };

  const handleQuickQuestion = (pergunta: string) => {
    setInputValue(pergunta);
  };

  const contaOptions = [
    { value: '', label: 'Sem contexto específico' },
    ...contas.map((conta) => ({
      value: conta.id!.toString(),
      label: `${conta.banco} - ${conta.numeroConta}`,
    })),
  ];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Chat com IA</h1>
          <div className="flex gap-2">
            <Select
              options={contaOptions}
              value={contaId?.toString() || ''}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setContaId(e.target.value ? Number(e.target.value) : undefined)
              }
              className="w-64"
            />
            <Button variant="secondary" onClick={clearChat}>
              <FiX className="mr-2" />
              Limpar
            </Button>
          </div>
        </div>

        {contaId && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Contexto ativo:</strong> Conta selecionada para análise personalizada
            </p>
          </div>
        )}

        {/* Perguntas Rápidas */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Perguntas Rápidas:
          </h3>
          <div className="flex flex-wrap gap-2">
            {PERGUNTAS_RAPIDAS_IA.map((pergunta, index) => (
              <Button
                key={index}
                variant="secondary"
                onClick={() => handleQuickQuestion(pergunta)}
                className="text-xs"
              >
                {pergunta}
              </Button>
            ))}
          </div>
        </div>

        {/* Área de Mensagens */}
        <div className="bg-white rounded-lg shadow-lg flex flex-col" style={{ height: '600px' }}>
          <div className="flex-1 overflow-y-auto p-6">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 py-12">
                <p className="text-lg mb-2">
                  Olá! Como posso ajudá-lo hoje?
                </p>
                <p className="text-sm">
                  Faça uma pergunta ou selecione uma das opções acima.
                </p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
              >
                <div
                  className={`max-w-[75%] rounded-lg p-4 shadow-sm ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-gray-50 text-gray-800 rounded-bl-none border border-gray-200'
                  }`}
                >
                  {message.role === 'user' ? (
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                  ) : (
                    <div className="prose prose-sm max-w-none prose-headings:mt-2 prose-headings:mb-2 prose-p:my-2 prose-ul:my-2 prose-ol:my-2">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  )}
                  <span className={`text-xs mt-3 block ${message.role === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                    {message.timestamp.toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                    <span className="text-sm text-gray-600">
                      A IA está pensando...
                    </span>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Digite sua pergunta... (Shift+Enter para nova linha)"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={2}
                disabled={isLoading}
              />
              <Button
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading}
              >
                <FiSend className="mr-2" />
                Enviar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

