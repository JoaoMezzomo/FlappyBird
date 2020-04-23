let novoJogo = false
const personagens = [
    'imgs/passaro.png',
    'imgs/superman.png',
    'imgs/mario.png',
    'imgs/megaman.png',
    'imgs/pikachu.png',
    'imgs/yoshi.png'
]

const nomesPersonagens = [
    '1) Passaro',
    '2) Superman',
    '3) Mario',
    '4) Megaman',
    '5) Pikachu',
    '6) Yoshi'
]

let personagemSelecionado = 0

let personagemMenu

function novoElemento(tagName, className){
    const elem = document.createElement(tagName)
    elem.className = className
    return elem
}

function Barreira(reversa = false){
    this.elemento = novoElemento('div', 'barreira')
    
    const borda = novoElemento('div', 'borda')
    const corpo = novoElemento('div', 'corpo')

    this.elemento.appendChild(reversa ? corpo : borda)
    this.elemento.appendChild(reversa ? borda : corpo)

    this.setAltura = altura => corpo.style.height = `${altura}px`
}


function ParDeBarreiras(altura, abertura, x){
    this.elemento = novoElemento('div', 'par-de-barreiras')

    this.superior = new Barreira(true)
    this.inferior = new Barreira(false)

    this.elemento.appendChild(this.superior.elemento)
    this.elemento.appendChild(this.inferior.elemento)

    this.sortearAbertura = () => {
        const alturaSuperior = Math.random() * (altura - abertura)
        const alturaInferior = altura - abertura - alturaSuperior

        this.superior.setAltura(alturaSuperior)
        this.inferior.setAltura(alturaInferior)
    }

    this.getX = () => parseInt(this.elemento.style.left.split('px')[0])
    this.setX = x => this.elemento.style.left = `${x}px`
    this.getLargura = () => this.elemento.clientWidth

    this.sortearAbertura()
    this.setX(x)
}

function Barreiras(altura, largura, abertura, espaco, notificarPonto){
    this.pares = [
        new ParDeBarreiras(altura, abertura, largura),
        new ParDeBarreiras(altura, abertura, largura + espaco),
        new ParDeBarreiras(altura, abertura, largura + espaco * 2),
        new ParDeBarreiras(altura, abertura, largura + espaco * 3)
    ]

    const deslocamento = 4
    this.animar = () => {
        this.pares.forEach(par => {
            par.setX(par.getX() - deslocamento)

            if(par.getX() < -par.getLargura())
            {
                par.setX(par.getX() + espaco * this.pares.length)
                par.sortearAbertura()
            }

            const meio = largura / 2
            const cruzouOMeio = par.getX() + deslocamento >= meio && par.getX() < meio

            if(cruzouOMeio)
            {
                notificarPonto()
            }
        })
    }
}

function Passaro(alturaJogo){
    let voando = false

    this.elemento = novoElemento('img', 'passaro')
    this.elemento.src = personagens[personagemSelecionado]

    this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0])
    this.setY = y => this.elemento.style.bottom = `${y}px`

    window.onkeydown = e => voando = true
    window.onkeyup = e => voando = false

    this.animar = () => {
        const novoY = this.getY() + (voando ? 10 : -6)
        const alturaMaxima = alturaJogo - this.elemento.clientHeight

        if(novoY <= 0)
        {
            this.setY(0)
        }
        else if(novoY >= alturaMaxima)
        {
            this.setY(alturaMaxima)
        }
        else
        {
            this.setY(novoY)
        }


    }

    this.setY(alturaJogo / 2)
}

function Progresso(){
    this.elemento = novoElemento('span', 'progresso')
    this.atualizarPontos = pontos => {
        this.elemento.innerHTML = pontos
    }
    this.atualizarPontos(0)
}

function estaoSobrepostos(elementoA, elementoB){
    const a = elementoA.getBoundingClientRect()
    const b = elementoB.getBoundingClientRect()

    const horizontal = a.left + a.width >= b.left
        && b.left + b.width >= a.left
    const vertical = a.top + a.height >= b.top
        && b.top + b.height >= a.top

    return horizontal && vertical
}

function Colidiu(passaro, barreiras){
    let colidiu = false
    barreiras.pares.forEach(parDeBarreiras => {
        if(!colidiu)
        {
            const superior = parDeBarreiras.superior.elemento
            const inferior = parDeBarreiras.inferior.elemento
            colidiu = estaoSobrepostos(passaro.elemento, superior) 
                || estaoSobrepostos(passaro.elemento, inferior)
        }
    })
    return colidiu
}

function CriarMenu(){
    let pontos = 0

    const areaDoJogo = document.querySelector('[wm-flappy]')
    const btnNovoJogo = novoElemento('button', 'botaoNovoJogo')
    btnNovoJogo.innerHTML = "Novo Jogo"
    areaDoJogo.appendChild(btnNovoJogo)
    
    const evento = document.querySelector('button')
    evento.setAttribute('onclick', 'NovoJogo()')

    const progresso = new Progresso()
    areaDoJogo.appendChild(progresso.elemento)
    progresso.elemento.style.display = 'none'


    const altura = areaDoJogo.clientHeight
    const largura = areaDoJogo.clientWidth
    const barreiras = new Barreiras(altura, largura, 250, 400, 
        () => progresso.atualizarPontos(++pontos))
    barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento))
    
    const dropPersonagens = novoElemento('select', 'personagens')
    let incremento = 0
    personagens.forEach(personagem => {
        personagem = novoElemento('option')
        personagem.innerHTML = nomesPersonagens[incremento]
        dropPersonagens.appendChild(personagem)
        incremento++
    })

    areaDoJogo.appendChild(dropPersonagens)
    const drop = document.querySelector('select')
    drop.setAttribute('onchange', 'SelecionarPersonagem()')

    const imgPersonagem = novoElemento('img', 'personagemMenu')
    imgPersonagem.src = personagens[personagemSelecionado]
    areaDoJogo.appendChild(imgPersonagem)
    personagemMenu = imgPersonagem

    const temporizadorMenu = setInterval(() => {
        barreiras.animar()

        if(novoJogo)
        {
            clearInterval(temporizadorMenu)
            areaDoJogo.removeChild(btnNovoJogo)
            areaDoJogo.removeChild(progresso.elemento)
            areaDoJogo.removeChild(dropPersonagens)
            areaDoJogo.removeChild(imgPersonagem)
            barreiras.pares.forEach(par => areaDoJogo.removeChild(par.elemento))
            new FlappyBird().start()
        }

    }, 20)
}

function SelecionarPersonagem(){
    const drop = document.querySelector('select')
    personagemSelecionado = drop.selectedIndex
    personagemMenu.src = personagens[personagemSelecionado]
}

function NovoJogo(){
    novoJogo = true
}

function ReiniciarJogo(){
    const areaDoJogo = document.querySelector('[wm-flappy]')
    const novaArea = areaDoJogo.cloneNode(false)
    const body = document.querySelector('body')
    body.removeChild(areaDoJogo)
    body.appendChild(novaArea)
    new FlappyBird().start()
}

function CriarReinicio(pontos){
    const areaDoJogo = document.querySelector('[wm-flappy]')
    const btnReiniciar = novoElemento('button', 'botaoNovoJogo')
    btnReiniciar.innerHTML = "Reiniciar"
    areaDoJogo.appendChild(btnReiniciar)
    
    const evento = document.querySelector('button')
    evento.setAttribute('onclick', 'ReiniciarJogo()')

    const placar = novoElemento('div', 'divPontosFinal')
    const h1 = novoElemento('h1')
    h1.innerHTML = pontos
    placar.appendChild(h1)
    areaDoJogo.appendChild(placar)

    const imgPersonagem = novoElemento('img', 'personagemMenu')
    imgPersonagem.src = personagens[personagemSelecionado]
    areaDoJogo.appendChild(imgPersonagem)
    personagemMenu = imgPersonagem

    const dropPersonagens = novoElemento('select', 'personagens')
    let incremento = 0
    personagens.forEach(personagem => {
        personagem = novoElemento('option')
        personagem.innerHTML = nomesPersonagens[incremento]
        dropPersonagens.appendChild(personagem)
        incremento++
    })
    areaDoJogo.appendChild(dropPersonagens)
    const drop = document.querySelector('select')
    drop.setAttribute('onchange', 'SelecionarPersonagem()')
    drop.selectedIndex = personagemSelecionado
}

function DerrubarPersonagem(personagem, pontos){
    const areaDoJogo = document.querySelector('[wm-flappy]')
    const altura = areaDoJogo.clientHeight

    this.getY = () => parseInt(personagem.style.bottom.split('px')[0])
    this.setY = y => personagem.style.bottom = `${y}px`

    
    const temporizador = setInterval(() => {
        let novoY = getY() + (-6)
        
        if(novoY <= 0)
        {
            this.setY(0)
            clearInterval(temporizador)
            CriarReinicio(pontos)
        }
        else
        {
            this.setY(novoY)
        }
    }, 20)
}

function FlappyBird(){
    let pontos = 0

    const areaDoJogo = document.querySelector('[wm-flappy]')
    const altura = areaDoJogo.clientHeight
    const largura = areaDoJogo.clientWidth

    const progresso = new Progresso()
    const barreiras = new Barreiras(altura, largura, 250, 400,
        () => progresso.atualizarPontos(++pontos))
    const passaro = new Passaro(altura)

    areaDoJogo.appendChild(progresso.elemento)
    areaDoJogo.appendChild(passaro.elemento)
    barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento))

    this.start = () => {
        const temporizador = setInterval(() => {
            barreiras.animar()
            passaro.animar()

            if(Colidiu(passaro, barreiras))
            {
                clearInterval(temporizador)
                DerrubarPersonagem(passaro.elemento, pontos)
            }
        }, 20)
    }

}

new CriarMenu()