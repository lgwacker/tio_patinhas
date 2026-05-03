# PRD: Tio Patinhas MVP - Sistema de Gestão de Investimentos

## Problem Statement

O usuário está insatisfeito com ferramentas externas de gestão de investimentos (como Bastter System, Investidor10, Kinvo) por dois motivos principais:
1. **Privacidade**: Não quer que seus dados financeiros fiquem em servidores de terceiros
2. **Dependência**: Não quer depender de serviços externos que podem mudar preços, políticas ou descontinuar funcionalidades

O usuário segue estratégia Buy and Hold em ações brasileiras (B3) e precisa acompanhar:
- Suas Posições (quantidade, preço médio, valor de mercado)
- Operações (compras e vendas)
- Evolução da Carteira ao longo do tempo

A solução precisa ser:
- 100% privada (dados locais)
- Acessível em desktop e mobile (PWA)
- Visualmente agradável e elegante (dark mode)
- Fácil de usar para registro manual de operações

## Solution

**Tio Patinhas** - Um sistema pessoal de gestão de investimentos:

- **Stack**: Next.js + TypeScript + PWA (Progressive Web App)
- **Persistência**: SQLite local (arquivo único, sem servidor)
- **Privacidade**: 100% offline, dados nunca saem do dispositivo
- **Design**: Dark mode elegante inspirado no Tio Patinhas (azul, dourado, vermelho)
- **Funcionalidades MVP**: Dashboard, Carteira, Posições, Operações (compra/venda)

O usuário poderá:
- Ver resumo da carteira (valor total, investido, ganhos/perdas)
- Navegar por Classe de Ativo (Ações, FIIs, etc)
- Visualizar Posições individuais com histórico de Operações
- Registrar Compras e Vendas manualmente
- Acompanhar evolução dos investimentos com cálculo automático de preço médio

## User Stories

### Dashboard e Visão Geral
1. Como investidor, quero ver o valor total da minha carteira ao abrir o app, para ter uma visão instantânea do meu patrimônio
2. Como investidor, quero ver quanto investi vs quanto tenho agora, para entender meu ganho/perda total
3. Como investidor, quero ver a distribuição da carteira por Classe de Ativo, para entender meu equilíbrio entre ações/FIIs/etc
4. Como investidor, quero ver as últimas operações realizadas, para acompanhar minha atividade recente

### Carteira e Posições
5. Como investidor, quero navegar entre abas de diferentes Classes de Ativo (Ações, FIIs), para focar em um tipo específico
6. Como investidor, quero ver uma lista de todas as minhas Posições em uma Classe, para acompanhar cada ativo
7. Como investidor, quero ver o ticker, quantidade, valor de mercado e ganho/perda de cada Posição, para avaliar performance
8. Como investidor, quero ver quanto cada Posição representa da carteira total (%), para entender concentração
9. Como investidor, quero ordenar as Posições por valor de mercado, para identificar meus maiores investimentos
10. Como investidor, quero clicar em uma Posição para ver seus detalhes, para aprofundar na análise

### Detalhes da Posição
11. Como investidor, quero ver o nome completo da empresa além do ticker, para identificar claramente o ativo
12. Como investidor, quero ver o preço atual de mercado do ativo, para comparar com meu preço médio
13. Como investidor, quero ver minha quantidade de ações e preço médio de aquisição, para saber meu custo
14. Como investidor, quero ver o valor total investido vs valor atual de mercado, para calcular meu ganho
15. Como investidor, quero ver o ganho/perda em R$ e em %, para avaliar performance de diferentes formas
16. Como investidor, quero ver uma barra visual mostrando investido vs atual, para visualizar meu retorno

### Operações
17. Como investidor, quero ver o histórico de Operações (compras/vendas) de uma Posição, para entender como cheguei aqui
18. Como investidor, quero ver data, tipo, quantidade e valor de cada Operação, para ter registro completo
19. Como investidor, quero adicionar uma nova Operação (compra ou venda), para atualizar minha Posição
20. Como investidor, quero digitar o ticker, data, quantidade e valor total da Operação, para registrar de forma simples
21. Como investidor, quero ver o preço unitário calculado automaticamente, para confirmar antes de salvar
22. Como investidor, quero que o sistema recalcule automaticamente meu preço médio após uma Operação, para não precisar calcular manualmente

### Design e UX
23. Como investidor, quero um design dark mode elegante, para uma experiência visual agradável
24. Como investidor, quero que ganhos apareçam em dourado e perdas em vermelho, para identificar rapidamente o sentimento
25. Como investidor, quero que o sistema funcione bem no celular, para consultar minha carteira em qualquer lugar
26. Como investidor, quero poder "instalar" o app na tela inicial do celular, para acesso rápido como um app nativo

### Dados e Cotações
27. Como investidor, quero que o sistema busque preços de mercado automaticamente via API, para não digitar manualmente
28. Como investidor, quero poder digitar manualmente o preço atual quando a API falhar, para não ficar sem dados
29. Como investidor, quero que meus dados fiquem salvos localmente em arquivo, para ter controle total e fazer backup

## Implementation Decisions

### Módulos Principais

1. **Domain/Calculator** (Deep Module)
   - Responsabilidade: Cálculos financeiros (preço médio, ganhos/perdas, totais)
   - Interface simples: input = operações, output = posição calculada
   - Testável em isolamento, regras de negócio puras

2. **Domain/Position** (Deep Module)
   - Responsabilidade: Entidade Posição e suas regras de consistência
   - Interface: criar, atualizar, validar operações
   - Centraliza lógica de modificação de posições

3. **Data/Database** (Deep Module)
   - Responsabilidade: Persistência SQLite (posições, operações, configurações)
   - Interface: CRUD operations, queries, migrations
   - Abstrai detalhes de SQL/schema

4. **Services/Quotes** (Deep Module)
   - Responsabilidade: Buscar cotações de APIs externas (Yahoo Finance, Brapi)
   - Interface: fetchPrice(ticker) → price | null
   - Fallback automático, cache local

5. **UI/Components**
   - Componentes reutilizáveis: Cards, Tabelas, Formulários, Gráficos
   - Design System: cores, tipografia, espaçamentos consistentes
   - Responsivo: adaptação desktop/mobile

6. **UI/Pages**
   - Dashboard (resumo)
   - Carteira (lista por classe)
   - Posição (detalhe do ativo)
   - Histórico (operações globais)
   - Configurações

### Decisões Técnicas

- **Stack**: Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **Banco**: SQLite via `better-sqlite3` (síncrono, mais simples para single-user)
- **API de Cotações**: Yahoo Finance (gratuito) com fallback Brapi
- **PWA**: Service worker para offline, manifest para instalação
- **Single-user**: Sem autenticação, apenas um usuário por instalação
- **Formatação**: Números em português-BR (R$ 1.234,56), alinhados à direita
- **Cores**: Dark mode obrigatório, sem light mode no MVP

### Schema do Banco (visão geral)

- `positions`: id, ticker, nome, classe_ativo, setor, segmento, quantidade, preco_medio, data_criacao
- `operations`: id, position_id, tipo (compra/venda), data, quantidade, valor_total, created_at
- `config`: chave, valor (para preferências do usuário)

### API Contracts

- GET `/api/positions` → lista de posições com valores calculados
- GET `/api/positions/[id]` → detalhe de uma posição + operações
- POST `/api/operations` → criar nova operação
- GET `/api/quotes/[ticker]` → buscar cotação atual

## Testing Decisions

### O que é um bom teste
- Testa comportamento externo, não implementação interna
- Fácil de entender o que está sendo testado
- Independente (não depende de estado de outros testes)
- Rápido

### Módulos a serem testados

1. **Domain/Calculator** (prioridade alta)
   - Cálculo de preço médio com múltiplas compras
   - Cálculo de ganho/perda (R$ e %)
   - Cenários edge: venda parcial, preço zero, valores negativos

2. **Domain/Position** (prioridade alta)
   - Adicionar operação atualiza quantidade corretamente
   - Validar tipos de operação permitidos
   - Consistência de dados

3. **Data/Database** (prioridade média)
   - CRUD operations funcionam
   - Migrations aplicam-se corretamente
   - Queries retornam dados esperados

4. **Services/Quotes** (prioridade média)
   - Retorna preço quando API responde
   - Retorna null quando API falha
   - Formata ticker corretamente para diferentes APIs

### Ferramentas de teste
- Jest para testes unitários
- React Testing Library para testes de componentes (se necessário)

## Out of Scope

As seguintes funcionalidades foram explicitamente deixadas fora do MVP:

1. **Integração automática com B3**: Importação de notas de corretagem via CSV ou API oficial fica para roadmap
2. **Operações automáticas**: Dividendos, bonificações, desdobramentos, grupamentos (serão manuais no MVP)
3. **Metas e alocação alvo**: Definir % alvo por classe/setor e alertas de desvio
4. **IRPF e declarações**: Exportação de dados para imposto de renda
5. **Ações americanas**: Foco apenas em B3 (BRL) no MVP
6. **Outras classes de ativo**: FIIs, Tesouro, etc serão estruturados no modelo de dados mas não terão funcionalidades específicas no MVP
7. **Light mode**: Apenas dark mode no MVP
8. **Múltiplos usuários**: Sistema single-user sem autenticação
9. **Nuvem/Sync**: Dados 100% locais, sem sincronização entre dispositivos
10. **Gráficos avançados**: Apenas gráficos simples de distribuição (donut/barras), sem gráficos de evolução temporal

## Further Notes

### Roadmap Pós-MVP

Prioridade sugerida para próximas funcionalidades:
1. Importação CSV de notas de corretagem
2. Suporte a dividendos e outros proventos
3. Ações americanas (NYSE/NASDAQ)
4. Metas de alocação por classe/setor
5. Exportação para IRPF
6. Integração oficial B3 (se viável)

### Design System

Cores principais:
- Background: `#0F172A`
- Primário: `#3B82F6`
- Lucros (dourado): `#F59E0B` ▲
- Perdas (vermelho): `#EF4444` ▼
- Texto: `#F8FAFC` / `#94A3B8`

Fonte: Inter (16px base)

### Decisões de UX

- Alinhamento: Texto à esquerda, números à direita
- Tabela em desktop → Cards em mobile
- Ordenação padrão: Valor Total decrescente
- Navegação lateral em todas as telas
- FAB (Floating Action Button) para adicionar operação

### Considerações de Performance

- SQLite síncrono é suficiente para single-user
- Cotações devem ter cache (não buscar a cada render)
- PWA deve ter service worker para offline básico
- Imagens/icons inline ou SVG (não depender de assets externos)
