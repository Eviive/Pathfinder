/**
 * @returns fills the grid with rows * columns squares
 */
function SetupGrid() {
	const container = $('.container')
	var square = document.createElement('div')
	square.className = 'square'
	container.attr('style', `--number: ${nb_rows};`)
	for (let i = 0; i < nb_rows * nb_columns; i++) {
		container.append(square.cloneNode(true))
	}
}

/**
 * @returns creates and fills the 2D array of squares
 */
function SetupArray() {
	let square_array = []
	let squares = $('.square')

	let i = 0
	while (i < nb_rows) {
		square_array[i] = []
		i++
	}

	i = 0
	let j
	while (i < nb_rows) {
		j = 0
		while (j < nb_columns) {
			square_array[i][j] = squares[j + nb_rows * i]
			j++
		}
		i++
	}

	return square_array
}

/**
 * @returns adds the click event that adds the 'spawn' class
 */
function Spawn() {
	$('html').off('click')
	$('html').off('mouseover')
	if (!cpt_spawn) {
		$('html').click( e => {
			if (e.target.matches('.square') && !e.target.matches('.destination')) {
				e.target.classList.add('spawn')
				e.target.classList.remove('wall')
				cpt_spawn = true
				$('html').off('click')
			}
		})
	}
}

/**
 * @returns adds the click event that adds the 'destination' class
 */
 function Destination() {
	$('html').off('click')
	$('html').off('mouseover')
	if (!cpt_destination) {
		$('html').click( e => {
			if (e.target.matches('.square') && !e.target.matches('.spawn')) {
				e.target.classList.add('destination')
				e.target.classList.remove('wall')
				cpt_destination = true
				$('html').off('click')
			}
		})
	}
}

/**
 * @returns adds a click event that that triggers the mouseover event that adds the 'wall' class
 */
function Walls() {
	$('html').off('click')
	$('html').off('mouseover')
	$('html').click( e => {
		if (e.target.matches('.square')) {
			e.target.classList.add('wall')
			$('html').mouseover( f => {
				if (f.target.matches('.square')) {
					f.target.classList.add('wall')
				}
			})
			$('html').click( g => {
				if (g.target.matches('.square') || g.target.matches('.btn-wall') || g.target.matches('.btn-spawn')) {
					$('html').off('click')
					$('html').off('mouseover')
				}
			})
		}
	})
}

/**
 * @returns resets the grid
 */
function Reset() {
	let reset = $('.btn-reset')
	let reset_img = $('.btn-reset img')
	reset.off('click')
	reset_img.addClass('active')
	setTimeout( _ => {
		reset_img.removeClass('active')
		reset.click( _ => Reset() )
	}, 2000)
	$('.spawn, .destination, .wall').removeClass(['spawn', 'destination', 'wall'])
	cpt_spawn = false
	cpt_destination = false
}

/**
 * @param {HTMLElement} square
 * @returns {[number, number]} the coordinates of the square
 */
function GetCoordinates(square) {
	let ct = document.querySelector('.container')

	let ct_left = ct.offsetLeft
	let ct_top = ct.offsetTop

	let sq_column = Math.abs((ct_left - square.offsetLeft) / 17)
	let sq_row = Math.abs((ct_top - square.offsetTop) / 17)

	return [sq_column, sq_row]
}

/**
 * @returns adds the 'parcours' class to the diagonal and anti-diagonal
 */
function Diagonal() {
	let i = 0, j = 0

	while (i < nb_columns && j < nb_rows) {
		$(square_array[i][j]).addClass('parcours')
		i++
		j++
	}

	i = nb_columns - 1
	j = 0

	while (i >= 0 && j < nb_rows) {
		$(square_array[i][j]).addClass('parcours')
		i--
		j++
	}
}





/***************number of columns and rows***************/
var nb_rows, nb_columns
nb_rows = nb_columns = 45

SetupGrid()
square_array = SetupArray()

cpt_spawn = false
$('.btn-spawn').click( _ => Spawn() )

cpt_destination = false
$('.btn-destination').click( _ => Destination() )

$('.btn-wall').click( _ => Walls() )

$('.btn-reset').click( _ => Reset() )

Diagonal()