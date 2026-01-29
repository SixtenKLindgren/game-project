import Menu from './Menu.js'
import MainMenu from './MainMenu.js'

export default class ControlsMenu extends Menu {
    constructor(game) {
        super(game)
        this.solidBackground = true
    }
    getTitle() {
        return 'Controls'
    }
    
    getOptions() {
        return [
            {
                text: 'W,A,S,D - Move',
                key: null,
                action: null
            },
            {
                text: 'Left Click - Shoot',
                key: null,
                action: null
            },
            {
                text: 'Space - Dash',
                key: null,
                action: null
            },
            {
                text: 'Back to Menu',
                action: () => {
                    this.game.gameState = 'MENU'
                    this.game.currentMenu = new MainMenu(this.game)
                }
            }
        ]
    }
}
