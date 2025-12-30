# Assistente Financeiro - Frontend

Sistema de gestão financeira pessoal completo com integração de IA.

## Tecnologias

- React 18+ com TypeScript
- Vite
- React Router v6
- Axios
- React Hook Form + Yup
- React Markdown
- Recharts
- Tailwind CSS
- Zustand (para gerenciamento de estado)
- React Toastify

##  Instalação

```bash
npm install
```

##  Executar

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`

##  Configuração

### Backend

Certifique-se de que o backend Spring Boot está rodando em `http://localhost:8080`

### Variáveis de Ambiente

As configurações estão em `src/utils/constants.ts`. Para alterar a URL da API:

```typescript
export const API_BASE_URL = 'http://localhost:8080';
```

##  Estrutura do Projeto

```
src/
├── components/       # Componentes reutilizáveis
│   ├── common/      # Componentes básicos (Button, Input, Modal, etc.)
│   └── layout/      # Componentes de layout
├── context/          # Context API (AuthContext)
├── hooks/            # Hooks customizados
├── pages/            # Páginas da aplicação
├── services/         # Serviços de API
├── types/            # Tipos TypeScript
├── utils/            # Utilitários (formatters, validators, constants)
└── App.tsx          # Componente principal com rotas
```

##  Autenticação

O sistema utiliza JWT para autenticação. O token é armazenado no `localStorage` e enviado automaticamente em todas as requisições.

### Usuário de Teste

- **Email:** admin@teste.com
- **Senha:** 123

##  Funcionalidades

### Autenticação
- Login
- Registro de usuário
- Logout automático em caso de token expirado

### Contas Bancárias
- Listagem de contas
- Criação e edição de contas
- Exclusão de contas
- Validação de número de conta único

### Movimentações Financeiras
- Listagem de movimentações
- Criação e edição de movimentações
- Filtros por tipo, categoria, período
- Estorno de movimentações
- Indicadores visuais (receitas/despesas)

### Metas de Economia
- Criação e gestão de metas
- Progresso visual com barras
- Atualização de progresso
- Pausar/reativar metas
- Integração com IA:
  - Análise de viabilidade
  - Geração de plano de ação
  - Sugestões de otimização

### Chat com IA
- Interface conversacional completa
- Seleção de conta para contexto financeiro
- Histórico de conversação
- Renderização de markdown
- Perguntas rápidas pré-definidas
- Loading states e tratamento de erros

### Dashboard
- Cards de resumo (saldo, receitas, despesas, metas)
- Gráficos (receitas vs despesas, distribuição por categoria)
- Movimentações recentes

##  Styling

O projeto utiliza Tailwind CSS para estilização. Os estilos customizados estão em `src/index.css`.

##  Fluxos Principais

1. **Autenticação:** Login → Dashboard
2. **Cadastro de Movimentação:** Seleciona conta → Preenche dados → Salva
3. **Criação de Meta:** Preenche dados → Opcional: Análise IA → Salva
4. **Chat IA:** Seleciona conta (opcional) → Envia pergunta → Recebe resposta

##  Importante

- Todas as datas devem estar no formato `YYYY-MM-DD`
- Valores monetários são formatados em BRL (R$)
- Timeout de 60s para requisições de IA
- Token JWT expira após determinado tempo (configurado no backend)

##  Troubleshooting

### Erro de CORS
Verifique se o backend está configurado para aceitar requisições de `http://localhost:3000`

### Token Expirado
O sistema redireciona automaticamente para login quando o token expira

### IA Indisponível
Verifique se o serviço de IA (Ollama/OpenAI) está configurado e rodando no backend

##  Licença

Este projeto faz parte do sistema Assistente Financeiro.

