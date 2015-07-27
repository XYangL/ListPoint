var root = null;
var divs = null;
var index = 0;
var targetTop = 0;

var init = function (){
	specificOrganizeBODY();

	// !!Important for makeing div scrollable
	root.css('overflow', 'scroll');

	root.height('90vh');
	root.width('98wh');

	root.prepend('<p id="preDiv"> </p>');
	root.append('<p id="postDiv"> </p>');
	
	$('#preDiv').height("20vh");
	$('#postDiv').height("70vh");

};

var specificOrganizeBODY = function(){
	/* convert ol>li to div+ol>li>div:first-child */
	ol = root.find('ol');
	ol.children().wrapInner("<div></div>");
	for (var i = ol.size() ; i >= 0; i--){
	 	target = ol.eq(i).parent().parent();
		target.prev().append(ol.eq(i));
		target.remove();
	}
	
	/* set level L_* for  ol */
	ol = root.find('ol');
	ol.each(function(){
		var level = $(this).parent().parent().attr('class');
		level = 'L_'.concat(parseInt(level.substr(-1))+1);
		$(this).addClass(level);
	});
	
	/* wrap title = ul>li>div:first-child with <p> */
	var firstTitle = root.find('ul>li>div:first-child').first();
	firstTitle.html("".concat("<p>",firstTitle.html(),"</p>"));
	
	var titles = root.find('ul').prev('div');
	for (var i = titles.size() - 1; i >= 0; i--) {
		titles.eq(i).html("".concat("<p>",titles.eq(i).html(),"</p>"));
	};

}

var setHL = function(object, mode){
	var temp = 0;
	
	if (mode === "one-line") {
	/* shrink, NOT highlight */
		/*---v4-6--new one-line height-------*/
		temp = object.next().children().outerHeight();

	} else if (mode === "full") {
	/* expand, IS highlight */
		if(object.children().first().attr('class')=="MathJax_Preview"){
		// for set  'MathJax' in highlight
			temp = object.height();
		} else {
			object.children().each(function(){
				temp += $(this).height();
				temp += parseInt( $(this).css("padding-top").replace("px", ""));
				temp += parseInt( $(this).css("padding-bottom").replace("px", ""));
			});
		}

		/*---v3---.hlBackground-------*/
		var borderTemp = object.outerHeight()-object.height();
		var HLBack = $('.hlBackground'); 
		HLBack.height(temp+borderTemp);
		HLBack.width(object.outerWidth(true));
	
	}

	object.height(temp);	
	return temp;
}


var triggerAnimate = function(unit,mode){
	if (unit == 0){	
			return 0;
	}

	var shrink = divs.eq(index);
	var expand = divs.eq(index+unit);

	// var prevL = shrink.parent().parent().attr('class').split(" ")[0];
	// prevL = parseInt(prevL.substr(-1));
	// var nextL = expand.parent().parent().attr('class').split(" ")[0];
	// nextL = parseInt(nextL.substr(-1));

	/* 3. Scroll : Get original position.top for computing $revise later */
	var shrinkOldHeight = shrink.height();
	var shrinkTop = $('.hlBackground').position().top;//console.log($('.hlBackground').position().top, shrink.position().top);
	var expandTop = expand.position().top;
	
	/* 0. Highlight target : change from shrink to expand */
	shrink.removeClass('highlight');
	expand.addClass('highlight');

	/* 1. shrink & expand : via resetting height */
	var oneLine = setHL(shrink, "one-line");
	setHL(expand, "full");

	/* 2. Show & Hide on the related items : based on the unit */
	var slideUpHeight = 0;  var slideDownHeight = 0;
	if(unit > 0){ // NEXT
		slideUpHeight += shrinkOldHeight-oneLine;

		// -1- show the detailed of expand
		expand.nextAll('ol,ul').slideDown('slow');//ol
		
		// -2- hide the detailed of shrink's previous sibling
		var slideUP = shrink.parent().prev().children('ul[style!="display: none;"], ol[style!="display: none;"]');	
		if(slideUP.size() !=0) 
		{
			slideUpHeight +=slideUP.outerHeight(true);
			slideUP.slideUp('slow');
		}

		// -5- More to support usable Prev
		if (mode== 'key'&& unit >1){ // press Down, skip details
			slideUP = shrink.nextAll('ol,ul');
			if(slideUP.size() !=0) 
			{
				slideUpHeight += slideUP.outerHeight(true);
				slideUP.slideUp('slow');
			}
		}

	} else if (unit < 0){ // PREV
		// -3- hide the detailed of shirnk
		shrink.nextAll('ol,ul').slideUp('slow');//ol
		
		if(unit == -1){
		// -4- show the detailed of expand's previous sibling
			var slideDown = expand.parent().prev().children('ul[style="display: none;"], ol[style="display: none;"]');
			if(slideDown.size() !=0) 
			{
				slideDownHeight = slideDown.outerHeight(true);
				slideDown.slideDown('slow');
			}

		} else{// UP
		// -1- show the detailed of expand
			expand.nextAll('ol,ul').slideDown('slow');//ol
		}
	} 

	/* 3. Scroll */
	var revise = expandTop - shrinkTop + slideDownHeight - slideUpHeight;
	// if (mode=='click') {
		targetTop = root.scrollTop();
	// };
	targetTop += revise;
	root.animate({scrollTop:targetTop},'slow');

	/* 0. Highlight target : update position */
	var HLBack = $('.hlBackground');
	HLBack.css("left",expand.position().left);

	/* 4. Background : on related items */
	$('.HLChildLevel').removeClass('HLChildLevel');
	expand.nextAll('ol,ul').addClass('HLChildLevel');//ol

	$('.HLSameLevel').removeClass('HLSameLevel');
	expand.parent().parent().addClass('HLSameLevel');//ol

	/*---v4-8--Scrollable Highlight-------*/
	// $('.highlight').css('background', '');
	// $('.hlBackground').css('background', '#5bc0de');

	return revise;
};


var main = function(){
	root = $('div.contentDiv');

	/* Reorganize & make it scroll*/
	init();

	divs = $("li>div:first-child");
	var num = divs.size();

	/* Action : Add id to every item for easy Navigation */
	for (  i = 0; i<num; i++){
		divs.eq(i).attr('id','item'.concat(i));
	}

	/* 0. Highlight target : set 1st HL target */
	var firstHL = divs.eq(index);
	firstHL.addClass('highlight');
	
	/* 0. Highlight target : init 1st HL position */
	root.parent().append('<div class="hlBackground"></div>')
	var HLBack = $('.hlBackground');
	HLBack.css(firstHL.position());	

	/* 1. shrink & expand : add div for recording oneLine height & init every item*/
	divs.each(function() {
		$(this).after('<div style="height:0;width:0;margin-bottom: 0px;"><p>oneline</p> </div>');
		setHL($(this),'one-line');
	});
	setHL(firstHL,"full");
	
	/* 2. Show & Hide : init every item */
	$('li>ol, li>ul').hide();

	/*---v4-8--Scrollable Highlight-------*/
	// $(window).bind('mousewheel DOMMouseScroll', function(event){
 	//  $('.highlight').css('background', '#5bc0de');
	// 	$('.hlBackground').css('background', '#fff');
	// });

	/* Action :  Relate the action to key */
	$(document).keydown(function(key) {	
		var unit = 0;	
		switch(parseInt(key.which,10)) {
			case 37:// Left : -1 | <-1
				if (index>0){
					var expand = divs.eq(index-1);
					if(expand.parent().parent().css('display') != 'none'){
						unit = -1;
					} else{
						var expandChildren = expand.parents('ul[style="display: none;"], ol[style="display: none;"]').last();
						var expandID = parseInt(expandChildren.prev().prev().attr('id').replace("item", ""));
						unit = expandID-index;
					}
				}
				break;
			case 38:// Up : <0
				var shrinkParent = divs.eq(index).parents('li').eq(1).children(':first-child');
				if (shrinkParent.size() ==1) {
					var expandID = parseInt(shrinkParent.attr('id').replace("item", ""));
					unit = expandID-index;
				};
				break;
			case 39: // Right : +1
				if (index+1<num){
					unit = 1;
				}				
				break;
			case 40:// Down : >0 	
				var childrenSize = divs.eq(index).siblings('ul,ol').find('li>div:first-child').size();
				unit = 1 + childrenSize;
				if (index+unit > num-1) {
					unit = 0;
				};			
				break;
		}; // END -- switch
		
		triggerAnimate(unit,'key');//var revise = 
		index += unit;

		return false; // disable scroll via arrow key
	});

	// /* Action :  Relate the action to click */
	$("li>div:first-child").click(function(event) {
		/* Act on the event */
		var expandID = parseInt($(this).attr('id').replace("item", ""));
		unit = expandID-index;
		// console.log(expandID, unit);

		triggerAnimate(unit,'click');//var revise = 
		index += unit;
	});

};

$(document).ready(main);