# Diagnóstico e implementação CRO - UAI Software

Data: 14 de julho de 2026

## Objetivo

Transformar a página inicial em um canal de aquisição com uma oferta principal clara: a Auditoria Express Gratuita do Site. O WhatsApp passa a ser o canal secundário de continuidade comercial.

## Principais gargalos encontrados

1. O menu tinha muitas opções e distribuía a atenção entre serviços, ERP, briefing, depoimentos e contato.
2. O hero comunicava otimização de sites, mas o CTA principal levava para outra página e competia com o briefing.
3. Os serviços eram apresentados como uma lista de funcionalidades, sem uma organização clara por resultado empresarial.
4. A home reunia auditoria, orçamento, briefing, WhatsApp e chat como caminhos comerciais concorrentes.
5. O formulário de contato solicitava mais informações do que o necessário para o primeiro diagnóstico.
6. O portfólio não mostrava imagens dos projetos nem explicava com clareza o desafio e a solução aplicada.
7. A prova social tinha nomes abreviados e, por isso, precisava de menos protagonismo do que experiência, projetos e processo.
8. A mensuração não cobria início, abandono e conclusão do formulário, origem do lead, filtros de portfólio e profundidade de rolagem.
9. Não havia uma política de privacidade ligada ao formulário nem controle de consentimento para medição de audiência.
10. O widget de chat adicionava carregamento e criava mais um canal concorrente no mobile.

## Nova arquitetura da informação

1. Barra de confiança e menu com seis destinos.
2. Hero com proposta de valor, auditoria gratuita e WhatsApp.
3. Indicadores de experiência e atendimento.
4. Identificação dos problemas que reduzem contatos.
5. Proposta de valor organizada em quatro pilares.
6. Processo da Auditoria Express com formulário curto na própria página.
7. Soluções organizadas em Atrair, Converter e Estruturar e proteger.
8. Projetos reais com filtros, imagens e contexto.
9. Comparativo entre site comum e site criado para vender.
10. Autoridade, história e diferenciais da empresa.
11. Relatos de clientes com destaque controlado.
12. Redução de risco e tratamento de objeções.
13. Conteúdos indexáveis e FAQ.
14. CTA final, contatos e links institucionais.

## Nova copy principal

- Hero: "Seu site deveria gerar clientes. Não apenas existir na internet."
- Problema: "Talvez seu site esteja afastando clientes sem você perceber."
- Proposta de valor: "Não entregamos apenas um site. Construímos um ativo comercial."
- Auditoria: "Descubra em até 24 horas o que está impedindo seu site de vender mais."
- Soluções: "Do primeiro clique à operação da empresa."
- Projetos: "Projetos e diagnósticos reais."
- Comparativo: "Seu site está em qual lado?"
- Autoridade: "Por que empresas escolhem a UAI Software?"
- Redução de risco: "Você não precisa contratar antes de saber qual é o problema."
- CTA final: "Seu próximo cliente pode estar visitando seu site agora. Ele está encontrando motivos para entrar em contato?"

## Decisões de preservação

- As URLs de auditoria, Google Ads, cibersegurança, ERP e matérias foram preservadas.
- Os conteúdos já indexáveis continuam acessíveis e ligados pela home.
- O GA4 existente foi mantido com Consent Mode.
- Os contatos reais não foram alterados.
- Os relatos existentes foram preservados, com a observação sobre nomes abreviados.
- O briefing continua acessível no rodapé, sem competir com o CTA principal.
- O chat Tawk.to foi retirado da home para reduzir carregamento e conflito com o WhatsApp e a barra mobile.
- Foram criadas páginas específicas para a história da empresa e a Política de Privacidade.

## Eventos preparados

Os eventos são enviados ao GA4 existente e também para `dataLayer` com o evento pai `uai_conversion`, permitindo configuração futura pelo Google Tag Manager.

| Evento | Finalidade |
| --- | --- |
| `audit_click` | Clique em qualquer CTA da auditoria |
| `whatsapp_click` | Clique para iniciar conversa no WhatsApp |
| `audit_form_start` | Primeiro foco no formulário |
| `audit_form_error` | Tentativa de envio com validação pendente |
| `audit_form_submit` | Envio válido para o serviço de formulário |
| `audit_form_success` | Retorno à confirmação de envio |
| `audit_form_abandon` | Saída após iniciar e antes de enviar |
| `project_view` | Abertura de projeto publicado |
| `portfolio_filter` | Uso dos filtros do portfólio |
| `service_view` | Acesso a uma página de serviço |
| `briefing_click` | Acesso ao briefing detalhado |
| `scroll_depth` | Profundidade de 25%, 50%, 75% e 90% |
| `content_expand` | Abertura de FAQ ou objeção |
| `analytics_consent_granted` | Aceite da medição de audiência |

### Conversões recomendadas

- Conversão principal: `audit_form_success`.
- Conversão secundária: `whatsapp_click`.
- Microconversões: `audit_form_start`, `audit_form_submit`, `project_view` e `briefing_click`.

O Google Ads pode importar as conversões do GA4 ou receber a tag diretamente pelo GTM. O ID do contêiner GTM e os IDs de conversão do Google Ads não foram adicionados porque não constavam no projeto.

## Captura da origem do lead

O formulário guarda a primeira origem disponível e envia:

- `utm_source`;
- `utm_medium`;
- `utm_campaign`;
- `utm_content`;
- página de referência;
- data do primeiro contato.

## Verificações executadas

- HTML semântico com um H1 por página.
- JSON-LD válido para organização, site, serviço e FAQ.
- Sitemap XML válido e atualizado.
- Links locais e imagens sem referências quebradas.
- JavaScript sem erro de sintaxe ou erro em execução.
- Validação amigável dos cinco campos obrigatórios, incluindo consentimento.
- Máscara de WhatsApp e normalização do endereço do site.
- Estado de confirmação após envio.
- Captura de UTM e filtros do portfólio.
- Testes em 1440 x 1000, 820 x 1050 e 390 x 844.
- Ausência de rolagem horizontal nos três tamanhos.
- Menu mobile, áreas de toque, rótulos, nomes acessíveis e imagens validados.
- Imagens do portfólio convertidas para WebP e carregadas sob demanda.

## Próximos testes A/B sugeridos

1. Headline atual versus "Quantos clientes seu site pode estar perdendo hoje?".
2. Formulário dentro do bloco da auditoria versus formulário em modal após o clique.
3. CTA "Quero minha análise gratuita" versus "Descobrir onde meu site perde clientes".
4. Painel de diagnóstico atual versus uma amostra anonimizada de relatório real.
5. Prova de experiência no hero versus prova de projetos no hero.
6. CTA final com WhatsApp visível versus somente a auditoria como ação.
7. Ordem "problemas antes dos pilares" versus "pilares antes dos problemas".
8. Formulário com empresa obrigatória versus empresa opcional.

Cada teste deve ter uma hipótese, uma conversão principal e volume suficiente antes da decisão.
