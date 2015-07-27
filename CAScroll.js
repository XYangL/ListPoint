var root = null;
var divs = null;
var num = 0;
var index = 0;
var targetTop = 0;

var HLBack = null;

var init = function (){
	root = $('div.contentDiv');
	
	specificOrganizeBODY();

	// !!Important for makeing div scrollable
	// root.css('overflow', 'scroll');

	root.height('90vh');
	root.width('98wh');

	root.prepend('<p id="preDiv"> </p>');
	root.append('<p id="postDiv"> </p>');
	
	$('#preDiv').height("35vh");
	$('#postDiv').height("45vh");

	/* Add div.hlBackground to highlight in Blue */
	HLBack = $('<div class="hlBackground"></div>');
	// HLBack = $('.hlBackground'); 
	root.append(HLBack);

	divs = $("li>div:first-child");
	num = divs.size();

	/*0. Scrollable: to support scroll action : Add id to every item for easy Navigation */
	for (  i = 0; i<num; i++){
		divs.eq(i).attr('id','item'.concat(i));
	}

	/* init 1st HL target */
	var firstHL = divs.eq(index);
	firstHL.addClass('highlight');

	/*1. Expand & Shrink : add div for recording oneLineH height & init every item*/
	divs.each(function() {
		$(this).after('<div style="height:0;width:0;margin-bottom: 0px;"><p>oneline</p> </div>');
		setHL($(this),'one-line');
	});
	/*3. Static Highilght Background :  init .hlBackground position, width, height*/
	initHLB(firstHL, setHL(firstHL,"full")); // setHL(firstHL,"full");
	
	/*2. Show & Hide : init every item */
	$('.contentDiv li>ol, .contentDiv li>ul').hide();

};

var specificOrganizeBODY = function(){
	/* Init relateDiv, fill it, & inset into DOM*/
	// 0.0 init RelateDiv
	var relateDiv = $("<div/>", {class: "relateDiv"});
	relateDiv.css('left', root.outerWidth(true)+10);
	relateDiv.css('top', 10);
	relateDiv.append( $('<ul/>'));

	// 0.1 Get Footnote & Replace
	$('.footnote-ref').text('');
	var FN = $('div.footnotes');//console.log(FN.size());
	FN.remove();
	FN.find('ol>li').each(function(){
		$(this).find('.footnote-backref').parent().remove();
		relateDiv.children(':first').append($(this));
	});

	// 0.2 Get Img & Replace
	var IMG = $('.contentDiv li>div>p>img')
	/* Add shrink description for img*/
	
	IMG.each(function(index, value) {
		var imgParentDiv = $(this).parent().parent();
		var level = imgParentDiv.parent().parent().attr('class');
		level = 'L_'.concat(parseInt(level.substr(-1))+1);
		
		var linkSUP = '<sup id=""><a href="#IMG:NO" class="footnote-ref"></a></sup>'.replace("NO", index);
		var desUL = imgParentDiv.parent().next().find('div>ul');
		if (desUL.size()>0) {
			desUL = desUL.eq(0);
			desUL.addClass(level);
			desUL.children().append(linkSUP);
			desUL.children().wrapInner('<p></p>');
			desUL.children().wrapInner('<div></div>');
			desUL.parent().parent().remove();// li
			desUL.insertAfter(imgParentDiv);
		};

		$(this).parent().html($(this).attr('alt')+ " <b>[img]</b>"	+  linkSUP );
		$(this).remove();
		var temp = $('<li/>',{id: 'IMG:NO'.replace("NO", index) }).append($(this));
		relateDiv.children(':first').append(temp);		
	});

	// 0.3 Add RelateDiv to body
	relateDiv.insertAfter(root);

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

	root.find('li>div~ul').parent().children(':first-child').each(function(index, el) {// div
		if($(this).has('p:first-child').size()==0){
			$(this).wrapInner('<p/>'); //console.log($(this).html());
		}		
	});
}

var initHLB = function(base, temp){
	HLBack.css(base.position());// Only set Top when init, and then keep it without change
	// HLBack.css("top",base.position().top);
	var borderTemp = base.outerHeight()-base.height();
	HLBack.height(temp+borderTemp);
	HLBack.width(base.outerWidth());
}

var updateHLB = function(base, temp){
	// HLBack.css(base.position());
	HLBack.css("left",base.position().left);

	// HLBack.height(base.outerHeight());
	var borderTemp = base.outerHeight()-base.height();
	HLBack.height(temp+borderTemp);
	HLBack.width(base.outerWidth());
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
	var oneLineH = setHL(shrink, "one-line");
	var fullH = setHL(expand, "full");

	/* 0. Highlight target : update position & width & height */
	// var HLBack = $('.hlBackground');
	updateHLB(expand, fullH);

	/* 0.0  Show User Defined Relationship*/
	var relateLI = expand.find('sup>a.footnote-ref');
	if (relateLI.size() ==0) {
		console.log('NO Related Info!');
		// $('.relateDiv').hide('slow', function(){
		// 	$('.hlBackground').width(expand.width());
		// 	$('.hlBackground').css("left",expand.position().left);
		// });
	$('.relateDiv').effect('slide', { direction: 'left', mode: 'hide' }, 'slow');
		// $('.relateDiv').hide('slow');
		// $('.hlSupport').removeClass('hlSupport');
	} else {
		// console.log('Get Related :', $(this).attr('href'));
		$('.hlSupport').removeClass('hlSupport');
		relateLI.each(function() {
			$($(this).attr('href').replace(':', '\\:')).addClass('hlSupport');
		});
		// $('.relateDiv').css("margin-top",shrinkTop+fullH/2-$('.relateDiv').height()/2);
		var st = shrinkTop + fullH/2.0-$('.relateDiv').outerHeight()/2.0 ;

		$('.relateDiv').animate({top: st}, 'slow');
		// $('.relateDiv').css('margin-top',st);
		// $('.relateDiv').show('slow');
		$('.relateDiv').effect('slide', { direction: 'left', mode: 'show' }, 'slow');
	}	

	/* 2. Show & Hide on the related items : based on the unit */
	var slideUpHeight = 0;  var slideDownHeight = 0;
	if(unit > 0){ // NEXT
		slideUpHeight += shrinkOldHeight-oneLineH;

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
	/* Reorganize & make it scroll*/
	init();

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
				event.preventDefault();
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
				event.preventDefault();
				var shrinkParent = divs.eq(index).parents('li').eq(1).children(':first-child');
				if (shrinkParent.size() ==1) {
					var expandID = parseInt(shrinkParent.attr('id').replace("item", ""));
					unit = expandID-index;
				};
				break;
			case 39: // Right : +1
				event.preventDefault();
				if (index+1<num){
					unit = 1;
				}				
				break;
			case 40:// Down : >0 	
				event.preventDefault();
				var childrenSize = divs.eq(index).siblings('ul,ol').find('li>div:first-child').size();
				unit = 1 + childrenSize;
				if (index+unit > num-1) {
					unit = 0;
				};			
				break;
		}; // END -- switch
		
		triggerAnimate(unit,'key');
		index += unit;

		// return false; // disable scroll via arrow key
	});

	// /* Action :  Relate the action to click */
	$("li>div:first-child").click(function(event) {
		/* Act on the event */
		var expandID = parseInt($(this).attr('id').replace("item", ""));
		unit = expandID-index;
		// console.log(expandID, unit);

		triggerAnimate(unit,'click');
		index += unit;
	});

};

$(document).ready(main);