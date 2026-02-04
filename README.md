# MVP Bavegação - Teste de Usabilidade

Uma ferramenta para criar protótipos navegáveis a partir de imagens do Figma e realizar testes de usabilidade.

## Funcionalidades

- **Upload de Telas**: Faça upload de imagens exportadas do Figma (PNG, JPG, etc.)
- **Editor de Hotspots**: Desenhe áreas clicáveis nas imagens e defina navegações entre telas
- **Player de Protótipo**: Teste o protótipo como se fosse um app real
- **Análise de Usabilidade**: 
  - Heatmaps de cliques
  - Rastreamento de sessões
  - Métricas de uso (duração, cliques por sessão, etc.)
  - Identificação de "cliques perdidos" (fora dos hotspots)

## Tecnologias

- React 18 + Vite
- React Router DOM
- Tailwind CSS
- Lucide React (ícones)
- LocalStorage para persistência

## Como Executar

### Pré-requisitos

- Node.js 18+ instalado
- npm ou yarn

### Instalação

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

O aplicativo estará disponível em `http://localhost:3000`

### Build para Produção

```bash
npm run build
npm run preview
```

## Como Usar

### 1. Criar um Projeto

1. Na página inicial, clique em "Novo Projeto"
2. Dê um nome ao seu projeto

### 2. Upload de Telas

1. Arraste as imagens do Figma ou clique para selecionar
2. Reorganize a ordem das telas se necessário
3. Dê nomes descritivos para cada tela

### 3. Criar Hotspots

1. No Editor, selecione uma tela
2. Clique em "Novo Hotspot" na barra de ferramentas
3. Desenhe uma área clicável na imagem
4. No painel de propriedades, selecione para qual tela esse hotspot deve navegar

### 4. Testar o Protótipo

1. Clique em "Testar Protótipo"
2. Navegue pelo protótipo clicando nas áreas definidas
3. Use os controles para voltar, reiniciar ou sair

### 5. Analisar Resultados

1. Acesse a página de Análise
2. Selecione o projeto
3. Visualize:
   - Número de sessões de teste
   - Total de cliques
   - Duração média das sessões
   - Heatmap de cliques por tela
   - Cliques perdidos (fora dos hotspots)

## Estrutura do Projeto

```
src/
├── hooks/
│   ├── useLocalStorage.js   # Hook para persistência
│   ├── useProjects.js       # Gerenciamento de projetos
│   └── useAnalytics.js      # Rastreamento de uso
├── pages/
│   ├── HomePage.jsx         # Lista de projetos
│   ├── UploadPage.jsx       # Upload de imagens
│   ├── EditorPage.jsx       # Editor de hotspots
│   ├── PlayerPage.jsx       # Player do protótipo
│   └── AnalyticsPage.jsx    # Análise de usabilidade
├── App.jsx                  # Componente principal
├── main.jsx                 # Entry point
└── index.css                # Estilos globais
```

## Licença

Projeto interno - PDCASE
