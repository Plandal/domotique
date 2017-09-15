	socket.on('allocineGetMovie', function(req){
		var obj = req.result;
		var moreInfo = req.moreInfo;
		console.log('moreInfo = ',moreInfo);
		var str = JSON.stringify(obj)
		var movie;
		if(Array.isArray(obj.movie)){
			movie = obj.movie[0];
		}else{
			movie = obj.movie;
		}
		console.log('obj = ',obj);
		var title = movie.originalTitle ? movie.originalTitle : 'Aucune donnée';
		var code = movie.code ? movie.code : 'Aucune donnée';
		var production = movie.productionYear ? movie.productionYear : 'Aucune donnée';
		var actors = movie.castingShort.actors ? movie.castingShort.actors : 'Aucune donnée';
		var poster = movie.poster.href ?  movie.poster.href : '';
		var src = movie.poster.href ? movie.poster.href : 'Aucune donnée';
		$('#getFilm').show();
		$('#MovieInTheaters').hide();
		$('#getFilmTitle').html(title);
		$('#getCode').html(code);
		$('#getProductionYear').html(production);
		$('#getActors').html(actors);
		$('#getPoster').attr('src',poster);
		$('#getInformations').html(src);
	});

	socket.on('allocineGetMovie', function(obj){
		var str = JSON.stringify(obj)
		console.log('allocineGetMovie = ',str);
		//$('div[data-type="alloBloc"]').hide();
		//$('#MovieInTheaters').show();
		//$('#MovieInTheatersList').html(str);
	});
