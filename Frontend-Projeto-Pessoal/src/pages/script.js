
let produtos = [
    {
        id: 1,
        nome: 'Creatina Monohidratada',
        tipo: 'Creatina',
        objetivo: 'recuperação muscular',
        preco: 79.90,
        precoOpcoes: { credito: 79.90, creditoParcelado: 84.90, pix: 75.90 },
        imagem: 'https://images.tcdn.com.br/img/img_prod/920697/tasty_whey_3w_900g_adaptogen_837_1_b6f504579c487c3def19678b05c70098.jpeg',
        fabricante: 'Adaptogen Science',
        descricao: 'recuperação muscular'
    },
    {
        id: 2,
        nome: '100% Whey Protein',
        tipo: 'Whey Protein',
        objetivo: 'ganho de massa muscular',
        preco: 99.90,
        precoOpcoes: { credito: 99.90, creditoParcelado: 106.90, pix: 94.90 },
        imagem: 'https://images.tcdn.com.br/img/img_prod/920697/tasty_whey_3w_900g_adaptogen_837_1_b6f504579c487c3def19678b05c70098.jpeg',
        fabricante: 'Max Titanium',
        descricao: 'ganho de massa muscular'
    },
    {
        id: 3,
        nome: 'Pre-Treino Insano',
        tipo: 'Pré Treino',
        objetivo: 'mais energia no treino',
        preco: 89.90,
        precoOpcoes: { credito: 89.90, creditoParcelado: 95.90, pix: 85.90 },
        imagem: 'https://images.tcdn.com.br/img/img_prod/920697/tasty_whey_3w_900g_adaptogen_837_1_b6f504579c487c3def19678b05c70098.jpeg',
        fabricante: 'New Millen',
        descricao: 'mais energia no treino'
    },
    {
        id: 4,
        nome: 'BCAA 2400',
        tipo: 'BCAA',
        objetivo: 'recuperação muscular',
        preco: 54.90,
        precoOpcoes: { credito: 54.90, creditoParcelado: 58.90, pix: 52.90 },
        imagem: 'https://images.tcdn.com.br/img/img_prod/920697/tasty_whey_3w_900g_adaptogen_837_1_b6f504579c487c3def19678b05c70098.jpeg',
        fabricante: 'Integralmedica',
        descricao: 'recuperação muscular'
    },
    {
        id: 5,
        nome: 'Glutamina Powder',
        tipo: 'Glutamina',
        objetivo: 'recuperação muscular',
        preco: 64.90,
        precoOpcoes: { credito: 64.90, creditoParcelado: 69.90, pix: 61.90 },
        imagem: 'https://images.tcdn.com.br/img/img_prod/920697/tasty_whey_3w_900g_adaptogen_837_1_b6f504579c487c3def19678b05c70098.jpeg',
        fabricante: 'Growth Supplements',
        descricao: 'recuperação muscular'
    },
    {
        id: 6,
        nome: 'Hipercalorico Mass Gainer',
        tipo: 'Hipercalórico',
        objetivo: 'ganho de massa muscular',
        preco: 119.90,
        precoOpcoes: { credito: 119.90, creditoParcelado: 129.90, pix: 113.90 },
        imagem: 'https://images.tcdn.com.br/img/img_prod/920697/tasty_whey_3w_900g_adaptogen_837_1_b6f504579c487c3def19678b05c70098.jpeg',
        fabricante: 'Black Skull',
        descricao: 'ganho de massa muscular'
    },
    {
        id: 7,
        nome: 'Termogenico Black Burn',
        tipo: 'Termogênico',
        objetivo: 'emagrecimento',
        preco: 69.90,
        precoOpcoes: { credito: 69.90, creditoParcelado: 74.90, pix: 65.90 },
        imagem: 'https://images.tcdn.com.br/img/img_prod/920697/tasty_whey_3w_900g_adaptogen_837_1_b6f504579c487c3def19678b05c70098.jpeg',
        fabricante: 'Dark Lab',
        descricao: 'emagrecimento'
    },
    {
        id: 8,
        nome: 'Multivitaminico Daily',
        tipo: 'Multivitamínico',
        objetivo: 'recuperação muscular',
        preco: 49.90,
        precoOpcoes: { credito: 49.90, creditoParcelado: 54.90, pix: 46.90 },
        imagem: 'https://images.tcdn.com.br/img/img_prod/920697/tasty_whey_3w_900g_adaptogen_837_1_b6f504579c487c3def19678b05c70098.jpeg',
        fabricante: 'Dux Nutrition',
        descricao: 'recuperação muscular'
    }
];
    function formatarPreco(valor, moedaPadrao="BRL"){
        const locale = navigator.language;
        return new Intl.NumberFormat(locale, {
            style: "currency",
            currency: moedaPadrao
        }).format(valor);
    }

    function capitalizeWords(text){
        if (!text || typeof text !== 'string') return text;
        return text.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
    }

    const dropdownMarca = document.getElementById("dropdown-marca")

  
   const marcasUnicas = [...new Set(produtos.map(p => p.fabricante))];

  
    marcasUnicas.forEach((marca)=>{
        const MarcaLi = document.createElement("li")
        const MarcaA = document.createElement("a")
        MarcaA.textContent=marca
        MarcaLi.append(MarcaA)
        dropdownMarca.appendChild(MarcaLi)

    })  
    const dropdownTipo = document.getElementById("dropdown-tipo")
    const tiposUnicos= [... new Set(produtos.map(p=> p.tipo))];
            tiposUnicos.forEach((tipo)=>{
                const tipoLi = document.createElement("li")
                const tipoA = document.createElement("a")
                tipoA.textContent=tipo
                tipoLi.appendChild(tipoA)
                dropdownTipo.append(tipoLi)
            })
    
    const dropdownObjetivo = document.getElementById("dropdown-objetivo")
    const objetivosUnicos = [... new Set(produtos.map(p => p.objetivo))];
            objetivosUnicos.forEach((objetivo)=>{
                const objetivoA = document.createElement("a")
                const objetivoLi = document.createElement("li")
                const objetivoFormatado = capitalizeWords(objetivo)
                objetivoA.textContent=objetivoFormatado
                objetivoLi.appendChild(objetivoA)
                dropdownObjetivo.appendChild(objetivoLi)
            })

    const produtosContainer = document.getElementById("produtos-container")
    function mostrarProdutos(produtos){
    produtos.forEach((produto) => {
        const card = document.createElement("div")
        card.classList.add("produto-card")
        const cardA = document.createElement("a")
        const precoValor = produto.preco ?? produto.precoOpcoes?.credito;
        const precoCredito = produto.precoOpcoes?.credito ?? precoValor;
        const precoCreditoParcelado = produto.precoOpcoes?.creditoParcelado ?? precoValor;
        const precoPix = produto.precoOpcoes?.pix ?? precoValor;

        card.innerHTML=`
        <a href="#"><img src="${produto.imagem}" alt="${produto.nome}">
        <h3>${produto.nome.toUpperCase()} - ${produto.fabricante.toUpperCase()}</h3>
        <h2>${formatarPreco(precoCredito)}</h2>
        <p>até <span>3x</span> de <span>${formatarPreco(precoCredito  / 3 )}</span> sem juros</p>
        <p>ou <span>${formatarPreco(precoPix)}</span> via Pix</p></a>
        `
 
        produtosContainer.appendChild(card)

    });
}
mostrarProdutos(produtos)
