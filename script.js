/**
 * @returns Fills the grid with rows * columns squares
 */
function SetupGrid() {
	let container = $('.container');
	let square = document.createElement('span');
	square.className = 'square';
	container.attr('style', `--sq-number: ${nb_rows}; --sq-size: ${sq_size}px`);
	for (let i = 0; i < nb_rows * nb_columns; i++) {
		container.append(square.cloneNode(true));
	}
}

/**
 * @returns {Array.<Array.<HTMLSpanElement>>} Creates and fills the 2D array of squares
 */
function SetupArray() {
	let square_array = [];
	let squares = $('.square');

	let i = 0;
	while (i < nb_rows) {
		square_array[i] = [];
		i++;
	}

	i = 0;
	let j;
	while (i < nb_rows) {
		j = 0;
		while (j < nb_columns) {
			square_array[i][j] = squares[j + nb_rows * i];
			j++;
		}
		i++;
	}

	return square_array;
}

/**
 * @returns Adds the click event that adds the 'spawn' class
 */
function Spawn() {
	$('html').off('click');
	$('html').off('mouseover');
	if (cpt_spawn) {
		$('html').click( e => {
			if (e.target.matches('.square') && !e.target.matches('.destination')) {
				e.target.classList.add('spawn');
				e.target.classList.remove('wall');
				cpt_spawn = false;
				$('.btn-spawn').text('Place spawn : 0');
				$('html').off('click');
			}
		})
	}
}

/**
 * @returns Adds the click event that adds the 'destination' class
 */
 function Destination() {
	$('html').off('click');
	$('html').off('mouseover');
	if (cpt_destination) {
		$('html').click( e => {
			if (e.target.matches('.square') && !e.target.matches('.spawn')) {
				e.target.classList.add('destination');
				e.target.classList.remove('wall');
				cpt_destination = false;
				$('.btn-destination').text('Place destination : 0');
				$('html').off('click');
			}
		})
	}
}

/**
 * @returns Adds a click event that that triggers the mouseover event that adds the 'wall' class
 */
function Walls() {
	$('html').off('click');
	$('html').off('mouseover');
	$('html').click( e => {
		if (e.target.matches('.square')) {
			e.target.classList.add('wall');
			$('html').mouseover( f => {
				if (f.target.matches('.square')) {
					f.target.classList.add('wall');
				}
			})
			$('html').click( g => {
				if (g.target.matches('.square') || g.target.matches('.btn-wall') || g.target.matches('.btn-spawn')) {
					$('html').off('click');
					$('html').off('mouseover');
				}
			})
			$('html').mouseover( g => {
				if (!$(g.target).closest('.container').length) {
					$('html').off('click');
					$('html').off('mouseover');
				}
			})
		}
	})
}

/**
 * @returns Resets the grid
 */
function Reset() {
	let reset = $('.btn-reset');
	let reset_img = $('.btn-reset img');
	reset.off('click');
	reset_img.addClass('active');
	setTimeout( _ => {
		reset_img.removeClass('active');
		reset.click( _ => Reset() );
	}, 1500)
	$('.spawn, .destination, .wall').removeClass(['spawn', 'destination', 'wall']);
	cpt_spawn = true;
	$('.btn-spawn').text('Place spawn : 1');
	cpt_destination = true;
	$('.btn-destination').text('Place destination : 1');
}

/**
 * @param {HTMLSpanElement} square
 * @returns {[number, number]} The coordinates of the square
 */
function GetCoordinates(square) {
	let ct = $('.container');

	let ct_left = ct.offset().left;
	let ct_top = ct.offset().top;

	let sq_row = Math.abs((ct_top - square.offset().top) / sq_size);
	let sq_column = Math.abs((ct_left - square.offset().left) / sq_size);

	return [sq_row, sq_column];
	/***************get the i and j directly from the array, not the offset***************/
}

/**
 * @returns Adds the 'parcours' class to the desired paths
 */
function ParcoursTest() {
	/***************diagonal***************/
	let i = 0, j = 0;
	while (i < nb_rows && j < nb_columns) {
		$(square_array[i][j]).addClass('parcours');
		i++;
		j++;
	}

	/***************anti-diagonal***************/
	i = nb_rows - 1;
	j = 0;
	while (i >= 0 && j < nb_columns) {
		$(square_array[i][j]).addClass('parcours');
		i--;
		j++;
	}

	/***************middle vertical***************/
	i = 0;
	j = Math.floor(nb_columns / 2);
	while (i < nb_rows) {
		$(square_array[i][j]).addClass('parcours');
		i++;
	}

	/***************middle horizontal***************/
	i = Math.floor(nb_rows / 2);
	j = 0;
	while (j < nb_columns) {
		$(square_array[i][j]).addClass('parcours');
		j++;
	}

	/***************vertical sides***************/
	i = 0;
	j = 0;
	while (i < nb_rows) {
		$(square_array[i][j]).addClass('parcours');
		$(square_array[i][j + nb_columns - 1]).addClass('parcours');
		i++;
	}

	/***************horizontal sides***************/
	i = 0;
	j = 0;
	while (j < nb_columns) {
		$(square_array[i][j]).addClass('parcours');
		$(square_array[i + nb_rows - 1][j]).addClass('parcours');
		j++;
	}
}

/**
 * @returns Sets up the click event on the play button
 */
function Event_Play() {
	$('.btn-play').click( _ => {
		var [spawn_row, spawn_column, destination_row, destination_column] = Play();
		console.log(spawn_row, spawn_column, destination_row, destination_column);
	})
}

/**
 * @returns Returns the coordinates of the spawn and the destination if they exist
 */
function Play() {
	let play = $('.btn-play');
	play.off('click');

	let sq_spawn = $('.spawn');
	let sq_destination = $('.destination');

	if (sq_spawn.length && sq_destination.length) {
		let [spawn_row, spawn_column] = GetCoordinates(sq_spawn);
		let [destination_row, destination_column] = GetCoordinates(sq_destination);
		Event_Play();
		return [spawn_row, spawn_column, destination_row, destination_column];
	}
	else
	{
		Event_Play();
		return [];
	}
}





/***************number of columns and rows***************/
var nb_rows, nb_columns, sq_size;
nb_rows = nb_columns = 45;
sq_size = 17;

SetupGrid();
square_array = SetupArray();

cpt_spawn = true;
$('.btn-spawn').click( _ => Spawn() )

cpt_destination = true;
$('.btn-destination').click( _ => Destination() )

$('.btn-wall').click( _ => Walls() )

$('.btn-reset').click( _ => Reset() )

Event_Play();

ParcoursTest();