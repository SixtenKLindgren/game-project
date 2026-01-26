import Menu from './Menu.js'

export default class PauseMenu extends Menu {
    getTitle() {
        return 'Game Paused'
    }

    getOptions() {
        return [
            {
                text: 'Resume',
                action: () => {
                    this.game.gameState = 'PLAYING'
                    this.game.currentMenu = null
                    this.game.inputHandler.keys.clear()
                }
            },
            {
                text: 'Restart',
                action: () => {
                    this.game.restart()
                    this.game.currentMenu = null
                }
            },
        ]
    }
}