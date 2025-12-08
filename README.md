# 🌱 ecoLog – Front-end

Este repositório contém a interface web do **ecoLog**, um sistema voltado para o acompanhamento das **emissões pessoais de CO₂**, desenvolvido como projeto de **Trabalho de Conclusão de Curso (TCC)** em Engenharia de Software.

---

## 🧩 Sobre o projeto

O **ecoLog** ajuda pessoas a entenderem e acompanharem o impacto das suas ações diárias no meio ambiente, com foco em duas frentes principais:

- **Consumo de energia elétrica residencial**
- **Uso de combustíveis em veículos**

A ideia é transformar dados que normalmente ficam “escondidos” (contas de luz, quilometragem, tipo de combustível etc.) em **informações visuais claras**, como gráficos, indicadores e comparações.

Com o ecoLog, o usuário pode:

- Registrar mensalmente seu consumo de energia e abastecimentos.
- Acompanhar a **evolução das emissões de CO₂** ao longo do tempo.
- Comparar seu desempenho com **médias de referência** (por exemplo, média do estado).
- Receber **dicas e sugestões** para reduzir o impacto ambiental.

O objetivo principal é ser uma ferramenta simples, visual e acessível que estimule mudanças de hábito por meio de dados concretos.

---

## 🛠️ Características técnicas

### ⚙️ Stack principal

O front-end do ecoLog foi desenvolvido como uma **SPA (Single Page Application)** usando:

- **React** com **TypeScript**
- **Ant Design (antd)** para componentes de interface
- **Chart.js** para gráficos
- **Day.js** para manipulação de datas
- **Axios** para consumo da API
- **React Router** para navegação entre páginas

### 🧱 Arquitetura do front-end

O projeto segue uma organização orientada a camadas de responsabilidade, facilitando manutenção e evolução:

- **Páginas (pages)**  
  Telas principais da aplicação, como:
  - Login / Cadastro
  - Dashboard de emissões
  - Tela de registro de energia
  - Tela de registro de combustível

- **Componentes (components)**  
  Componentes reutilizáveis de interface (botões, cards, formulários, cabeçalhos, etc.), aproveitando e estendendo o Ant Design sempre que possível.

- **Serviços (services)**  
  Módulos responsáveis pela comunicação com a API back-end (ecoLog API), encapsulando chamadas HTTP com Axios, tratamento básico de erros.

- **Tipos / DTOs (types ou dto)**  
  Definições de tipos e modelos (TypeScript) para representar:
  - Usuário
  - Registros de consumo
  - Respostas da API

- **Contextos / Hooks (context / hooks)**  
  Uso de Context API e hooks personalizados para:
  - Gerenciar o estado de autenticação (usuário logado, token, etc.).
  - Compartilhar dados globais como configurações do usuário.

### 🔐 Integração com o back-end

O front-end consome uma **API REST** desenvolvida em **.NET**, responsável por:

- Autenticação e autorização com **JWT**.
- Cálculo das emissões com base em fatores de emissão (energia e combustível).
- Persistência dos dados de consumo e das emissões.

### 🎨 Interface e experiência do usuário

- Uso dos componentes do **Ant Design**, garantindo:
  - Layout responsivo.
  - Formulários com validações claras.
  - Cards e indicadores no dashboard.
- **Gráficos com Chart.js**, permitindo:
  - Visualizar a evolução mensal das emissões.
  - Separar emissões por tipo de fonte (energia vs. combustível).
  - Comparar emissões atuais com metas e médias.

### 🧪 Qualidade de código 

- Todo o código foi testado usando jest e react testing library

### 🚀 Como executar o projeto localmente


```bash
# Clonar o repositório
git clone https://github.com/1GuilhermeSR/ecoLog_frontEnd.git
cd ecoLog_frontEnd

# Instalar dependências
npm install

# Rodar em ambiente de desenvolvimento
npm start

# Gerar build de produção
npm run build
