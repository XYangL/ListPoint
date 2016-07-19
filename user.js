var userFunction = {

initCover : function(){
	var coverURL = typeof configs['coverURL']!== "undefined" ? configs['coverURL']:"images/cover.gif";
	var coverFN = $('<p/>').append($('<img/>',{'src':coverURL, "class": "bottom"}));
	coverFN.append('&#160;<a href="#fnref:img:cover" class="footnote-backref">&#8617;</a>');
	coverFN = $('<li/>',{'id':'fn:img:cover'}).append(coverFN);

	$('.footnotes>ol').append(coverFN);
},

setCover : function(){
	var coverTarget = $('<a/>',{"href":"#fn:img:cover", "class":"footnote-passive"});
	coverTarget.append($('<span class="ui-icon ui-icon-image"></span>'));
	$('#title>p').append($('<sub/>').append(coverTarget));

	$("#fn\\:img\\:cover").attr('location', 'bottom');

    // $('body').trigger(
    //     jQuery.Event( 'keydown', { keyCode: 32, which: 32 } )
    // );
	setTimeout(function () { 
		toggleHide();
	}, 1000);
},

beforeInit : function(){
	imgSizeCustomer['fn:img:cover'] = [900, 350];

	this.initCover();
},

afterInit : function(){

	this.setCover();

}

}