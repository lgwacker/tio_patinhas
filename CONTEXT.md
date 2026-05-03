# Contexto: Tio Patinhas

Sistema pessoal de gestão de investimentos e finanças.

---

## Glossário

| Termo | Definição |
|-------|-----------|
| **Posição** | Um ativo específico na carteira do investidor, identificado por seu ticker (ex: PETR4), contendo quantidade atual, preço médio de aquisição e valor de mercado atual. Calculada a partir das Operações. |
| **Operação** | Um evento que modifica uma Posição. No MVP: Compra ou Venda. Registra: data, tipo, quantidade, valor total (R$). Preço unitário é derivado: valor ÷ quantidade. |
| **Ativo** | Um instrumento financeiro negociado em bolsa — no escopo atual: ações brasileiras (B3). |
| **Carteira** | O conjunto de todas as Posições de um investidor em um determinado momento. |
| **Preço Médio** | Valor total investido em uma Posição ÷ quantidade de ações. Calculado dinamicamente a partir do histórico de Operações. |
| **Classe de Ativo** | A categoria do investimento: Ação, Fundo Imobiliário (FII), Renda Fixa (ex: Tesouro), etc. Determina onde e como o ativo é negociado. |
| **Setor** | A indústria ou setor da economia a que o ativo pertence (ex: Finanças, Energia, Materiais Básicos). Relevante para diversificação da carteira. |
| **Segmento** | Uma subdivisão mais específica dentro de um Setor (ex: Bancos dentro de Finanças, Petróleo dentro de Energia). |

---

## Modelo mental

O investidor segue estratégia **Buy and Hold**.
Ações são mantidas por longos períodos.
O valor está em acompanhar evolução das posições ao longo do tempo, não em trading frequente.

---

## Decisões técnicas resolvidas

- Stack: Next.js (full-stack TypeScript) com PWA — responsivo e instalável como app no mobile.
- Cotações: API gratuita (Yahoo Finance ou similar) com fallback para entrada manual.
- Persistência: SQLite local em arquivo — single-user, sem autenticação.
- Escopo inicial: Apenas ações brasileiras (B3) em BRL. Bolsa americana é roadmap futuro.
- Operações MVP: Compra e Venda (registro manual).
- Roadmap de automação: Eventos corporativos (bonificações, desdobramentos, grupamentos, dividendos/JCP) devem ser automatizados via integração futura.
- Modelo de dados: Cada ativo possui Classe de Ativo, Setor e Segmento (quando aplicável).
- Integração B3: MVP = entrada manual. Roadmap = importação CSV de notas de corretagem. Futuro = integração oficial B3 (avaliação depois).

## Roadmap (pós-MVP)

- Metas: % alvo por classe de ativo, alertas de desvio
- IRPF: exportação para declaração (vendas, dividendos)
- Operações automáticas: dividendos, bonificações, desdobramentos, grupamentos
- Integração B3: importação CSV de notas de corretagem
- Integração B3 oficial (avaliação futura)

## Escopo do MVP — Tio Patinhas v1.0

**Funcionalidades:**
1. Dashboard simples: total da carteira, valor investido, ganho/perda geral
2. Carteira com abas por Classe de Ativo (Ações | FIIs | etc)
3. Lista de posições em cada aba com: ticker, quantidade, valor mercado, % carteira, variação %/R$
4. Tela de Posição (detalhe do ativo): resumo + histórico de operações + botão "+ Operação"
5. Cadastro de Operação: Compra/Venda (data, quantidade, valor total)
6. Preview de preço unitário ao cadastrar
7. Cálculo automático de preço médio e variações

**Visual:** Foco em experiência agradável, responsiva, PWA-ready

**Prioridade:** UX/UI refinada sobre funcionalidades extras  
**Design:** Tema dark elegante inspirado no Tio Patinhas
- Background: `#0F172A` (azul-marinho escuro)
- Primário (botões, links): `#3B82F6` (azul vibrante)
- Destaque positivo/lucros: `#F59E0B` (dourado) — identidade Tio Patinhas
- Destaque negativo/perdas: `#EF4444` (vermelho)
- Texto principal: `#F8FAFC` (branco suave)
- Texto secundário: `#94A3B8` (cinza azulado)

**Tipografia:**
- Fonte principal: Inter (toda a interface)
- Títulos: Inter Bold
- Tamanho base: 16px

**Navegação:**
- Menu lateral recolhível em todas as telas (4 itens: Dashboard, Carteira, Histórico, Configurações)
- Desktop: ícone + texto expandido
- Mobile: ícone compacto ou hamburger menu
- FAB (Floating Action Button) "+" na Carteira e Posição para adicionar operação

**Dashboard (tela inicial):**
- Card: Total da Carteira com variação % e R$
- Card: Valor Investido vs Ganho Total
- Card: Distribuição por Classe (gráfico donut/barras)
- Lista: Últimas 3-5 operações

**Tela Carteira (lista de posições):**
- Desktop: Tabela com colunas — Ticker (esquerda), Quantidade, Valor Total (negrito), Investido, Ganho R$, Ganho %, % da Carteira (barra visual)
- Mobile: Cards empilhados com as mesmas informações
- Alinhamento: Texto à esquerda, números à direita
- Cores ganhos/perdas: Dourado `#F59E0B` com ▲ para lucros, Vermelho `#EF4444` com ▼ para perdas
- Ordenação padrão: Por Valor Total (decrescente)

**Tela Posição (detalhe do ativo):**
- Header: Ticker, nome da empresa, preço atual, variação do dia
- Card de resumo: Quantidade, Preço Médio, Total Investido, Valor Atual, Ganho Total (R$ e %), barra de progresso Investido→Atual
- Lista de operações: Data, Tipo, Quantidade, Preço Unitário, Total — ordenado por data (mais recente primeiro)

**Testes:**
- Todos os módulos serão testados: Calculator, Position, Database, Quotes
- Abordagem: Testar comportamento externo, não implementação interna

## Decisões de UX/UI resolvidas

- Navegação da Carteira: Abas por Classe de Ativo (Ações | FIIs | Tesouro) → dentro de cada aba, lista com Setor + filtro
- Breakdown: % da carteira por Classe (visão geral) e por Setor (dentro de cada aba)

## Decisões técnicas resolvidas

- Cotações: Usar API gratuita (Yahoo Finance ou similar) com fallback para entrada manual quando necessário.
