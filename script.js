/**
 * @param {number} nb_rows integer number of rows
 * @param {number} nb_columns integer number of columns
 * @returns fills the grid rows * columns squares
 */
function SetupGrid(nb_rows, nb_columns) {
	var square = document.createElement('div')
	square.className = 'square'
	container.attr('style', `--number: ${nb_rows};`)
	for (let i = 0; i < nb_rows * nb_columns; i++) {
		container.append(square.cloneNode(true))
	}
}

/**
 * @returns adds the click event that adds the 'spawn' class
 */
function Spawn() {
	$('html').off('click')
	$('html').off('mouseover')
	if (cpt_spawn < 1) {
		$('html').click( e => {
			if (e.target.matches('.square') && !e.target.matches('.destination')) {
				e.target.classList.add('spawn')
				e.target.classList.remove('wall')
				cpt_spawn++
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
	if (cpt_destination < 1) {
		$('html').click( e => {
			if (e.target.matches('.square') && !e.target.matches('.spawn')) {
				e.target.classList.add('destination')
				e.target.classList.remove('wall')
				cpt_destination++
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
	setTimeout(() => {
		reset_img.removeClass('active')
		reset.click( e => {
			Reset()
		})
	}, 2000)
	squares.each( function () {
		$(this).removeClass(['spawn', 'destination', 'wall'])
	})
	cpt_spawn = 0
	cpt_destination = 0
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
 * @param {number} column integer number of the column
 * @param {number} row integer number of the row
 * @returns {HTMLElement} returns the square corresponding to the coordinates
 */
function GetSquare(column, row) {
	let ct = document.querySelector('.container')

	let ct_left = ct.offsetLeft
	let ct_top = ct.offsetTop

	let sq_left = column * 17
	let sq_top = row * 17

	for (let i = 0; i < squares.length; i++) {
		if (squares[i].offsetLeft - ct_left === sq_left && squares[i].offsetTop - ct_top === sq_top) {
			return squares[i]
		}
	}
}

/**
 * @returns adds the 'parcours' class to the diagonal and anti-diagonal
 */
function Diagonal() {
	let i = 0, j = 0
	let sq_column, sq_row

	while (i < nb_columns && j < nb_rows) {
		$(GetSquare(i, j)).addClass('parcours')
		i++
		j++
	}

	i = nb_columns - 1
	j = 0

	while (i >= 0 && j < nb_rows) {
		$(GetSquare(i, j)).addClass('parcours')
		i--
		j++
	}
}



const container = $('.container')

var nb_rows, nb_columns
nb_rows = nb_columns = 45

SetupGrid(nb_rows, nb_columns)

var squares = $('.square')

cpt_spawn = 0
$('.btn-spawn').click( e => {
	Spawn()
})

cpt_destination = 0
$('.btn-destination').click( e => {
	Destination()
})

$('.btn-wall').click( e => {
	Walls()
})

$('.btn-reset').click( e => {
	Reset()
})

Diagonal()