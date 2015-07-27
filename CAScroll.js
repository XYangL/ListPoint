var root = null;
var divs = null;
var num = 0;
var index = 0;
var targetTop = 0;

var HLBack = null;
var relateDiv = null;
var initLeft = 0;

var init = function (){
	root = $('div.contentDiv');
	
	specificOrganizeBODY();

	divs = $("li>div:first-child");
	num = divs.size();

	/*0. Scrollable: to support scroll action : Add id to every item for easy Navigation */
	for (  i = 0; i<num; i++){
		divs.eq(i).attr('id','item'.concat(i));
	}

	/*1. Expand & Shrink : add div for recording oneLineH height & init every item*/
	divs.each(function() {
		$(this).after('<div style="height:0;width:0;margin-bottom: 0px;"><p>oneline</p> </div>');
		setHeight($(this),'one-line');
	});
	
	/*2. Show & Hide : init every item */
	$('.contentDiv li>ol, .contentDiv li>ul').hide();

	/* init 1st HL target */
	var firstHL = divs.eq(index);
	firstHL.addClass('highlight');

	initWrap();

	/*3. Static Highilght Background :  init .hlBackground position, width, height*/
	initHLB(firstHL, setHeight(firstHL,"full")); // setHeight(firstHL,"full");

	/*6. User Defined Relationship : init .relateDiv position */
	initRDiv()

};

var specificOrganizeBODY = function(){
	$('body >*').wrapAll("<div class='container' />");
	root.wrap("<div class='contentWrap' />");

	root.prepend('<p id="preDiv" style="height: 35vh;"> </p>');
	root.append('<p id="postDiv" style="height: 65vh;"> </p>');

	/*3. Static Highilght Background*/
    /* Add div.hlBackground to highlight in Blue */
	HLBack = $('<div class="hlBackground"></div>'); // HLBack = $('.hlBackground'); 
	HLBack.insertAfter(root);

	/*6. User Defined Relationship */
	var fillRelateDiv = function( RDiv ){
		// S1: Get Footnote, remove from DOM & insert into relateDiv
		$('.footnote-ref').text('');
		var FN = $('div.footnotes');//console.log(FN.size());
		FN.remove();
		FN.find('ol>li').each(function(){
			$(this).find('.footnote-backref').parent().remove();
			var temp = $('<div/>',{id: $(this).attr('id')}).append($(this).html());
			RDiv.children(':first').append(temp);
		});

		// S2: Get Img, replace it with des-list in DOM & insert img into relateDiv
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
			var temp = $('<div/>',{id: 'IMG:NO'.replace("NO", index) }).append($(this));
			RDiv.children(':first').append(temp);		
		});
	}
	/* Init relateDiv, fill it, & inset into DOM*/
	// 0.0 init RelateDiv
	relateDiv = $("<div/>", {class: "relateDiv"});
	relateDiv.append( $('<div/>'));

	// 0.1 Get Footnote & Replace
	// 0.2 Get Img & Replace
	fillRelateDiv(relateDiv);

	// 0.3 Add RelateDiv to body
	relateDiv.insertAfter(root.parent());

	/*7. Other special requirement of CAScroll on DOM structure */
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
	/*  Depend on base - $('.highlight')
		Only set Top when init, and then keep it without change*/
	HLBack.css("top",base.position().top);// HLBack.css(base.position());
	updateHLB(base, temp);
}

var updateHLB = function(base, temp){
	/*	Depend on base - $('.highlight')
		HLB.height has transition, which need to be varied to final value,
		so get its height from temp,  instead of using .outHeight() directly*/
	HLBack.css("left",base.position().left); // HLBack.css(base.position());

	// HLBack.height(base.outerHeight());
	var borderTemp = base.outerHeight()-base.height();
	HLBack.height(temp+borderTemp);
	HLBack.width(base.outerWidth());
}

var initWrap = function(){
	/* The whole .contentWrap should be in the center of the screen*/
	initLeft = ($('body').outerWidth()-$('.contentWrap').outerWidth())/2;
	$('.contentWrap').css('left', initLeft );
}

var initRDiv = function () {
	/*relateDiv.max-width = 50wh, 
	  contentDiv.width = 98wh, max-width = 1024,
	  so if wh<2048/0.98, relative Div will be overlapped by contentDiv*/
	relateDiv.css('left', initLeft);
	
	/*.relateDiv:margin-left/rifht is 10px each, border is 1 each, padding is 1 each*/
	// relateDiv.css('max-width', $('body').outerWidth()- root.outerWidth(true) -20 -2 -2);
	var relateDivBox = relateDiv.outerWidth(true)-relateDiv.width();
	relateDiv.css('max-width', $('body').outerWidth()- root.outerWidth(true) - relateDivBox);

	relateDiv.children().children().each(function(index, el) {
		console.log($(this).attr('id'), $(this).outerWidth(), $(this).width());
		$(this).width($(this).width())
		$(this).hide();
	});

	relateDiv.hide();
}

var hasRDiv = function(expand){
	var RDivWidth = 0, RDivHeight = 0, target = null;
	
	var relateLI = expand.find('sup>a.footnote-ref');
	if (relateLI.size() ==0) { /*NO need to show*/
		hideRDiv();
	} else {  /*Need to show*/ 
		relateLI.each(function() {
			target = $($(this).attr('href').replace(':', '\\:'));
			if ($('.hlSupport').attr('id') != target.attr('id') ){
				$('.hlSupport').hide()
				$('.hlSupport').removeClass('hlSupport');
			}
			target.addClass('hlSupport');
			target.show();
		});
		RDivWidth = relateDiv.outerWidth(true);
		RDivHeight = relateDiv.outerHeight(true);
	}
	return { RLI:target,  width: RDivWidth, height: RDivHeight };
}

var setRDivLeft = function(target){
	relateDiv.animate({left:$('body').offset().left +initLeft + $('.contentWrap').outerWidth(true) - target.width/2},'slow');
}
var setRDivTop = function(target, temp){
	relateDiv.animate({top:HLBack.offset().top + temp/2 - target.height/2},'slow');
}

var hideRDiv = function(){
	// relateDiv.hide('slow');
	relateDiv.effect('slide', { direction: 'right', mode: 'hide' }, 'slow');
}
var showRDiv = function(){
	// relateDiv.show('slow');
	relateDiv.effect('slide', { direction: 'left', mode: 'show' }, 'slow');
}

var setHeight = function(object, mode){
	var temp = 0;
	
	if (mode === "one-line") {
	/* shrink, NOT highlight */ /*---v4-6--new one-line height-------*/
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
	if (unit == 0){	return 0; }
	var scroll = function(){
		//5 change .HL /* Reset .highlight target : change from shrink to expand */
		shrink.removeClass('highlight');
		expand.addClass('highlight');

		//6 setHeight()	/*1. Expand & Shrink : via resetting height */
		var oneLineH = setHeight(shrink, "one-line");
		var fullH = setHeight(expand, "full");	

		//7
		setRDivTop(relateTarget, fullH);

		//8 
		if (relateTarget.RLI != null) {
			showRDiv();
		}

		//9	/*2. Show & Hide on the related items : based on the unit */
		var slideUpHeight = 0;  var slideDownHeight = 0;
		if(unit > 0){ // NEXT
			slideUpHeight += shrinkOldHeight-oneLineH;

			// -1- show the detailed of expand
			expand.nextAll('ol,ul').slideDown('slow');//ol
			
			// -2- hide the detailed of shrink's previous sibling
			var slideUP = shrink.parent().prev().children('ul[style!="display: none;"], ol[style!="display: none;"]');	
			if(slideUP.size() !=0) 
			{
				slideUpHeight += slideUP.outerHeight(true);
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

		//10 
		updateHLB(expand, fullH);

		//11/* 4. Background : on related items */
		$('.HLChildLevel').removeClass('HLChildLevel');
		expand.nextAll('ol,ul').addClass('HLChildLevel');//ol

		$('.HLSameLevel').removeClass('HLSameLevel');
		expand.parent().parent().addClass('HLSameLevel');//ol
		
		//12/*0. Scrollable*/
		var reviseTop = expandTop - shrinkTop + slideDownHeight - slideUpHeight;
		// if (mode=='click') {
			targetTop = root.scrollTop();
		// };
		targetTop += reviseTop;
		root.animate({scrollTop:targetTop},'slow');

	}

	//1
	var shrink = divs.eq(index);
	var expand = divs.eq(index+unit);

	/* Get original position.top for computing $revise and other use later */
	/* !! Must Before reset .highlight */
	var shrinkOldHeight = shrink.height();
	var shrinkTop = $('.hlBackground').position().top;
	var expandTop = expand.position().top;

	//2
	var relateTarget = hasRDiv(expand);
	
	//3
	setRDivLeft(relateTarget);

	//4
	var targetLeft = initLeft - (relateTarget.width) /2;
	(relateTarget.RLI == null) && (relateDiv.css('display') == 'none') ? scroll() 
			: $('.contentWrap').animate({left:targetLeft},'slow', function(){
				scroll();
			});

	/*---v4-8--Scrollable Highlight-------*/
	// $('.highlight').css('background', '');
	// $('.hlBackground').css('background', '#5bc0de');
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
		unit = expandID-index;// console.log(expandID, unit);

		triggerAnimate(unit,'click');
		index += unit;
	});

};

$(document).ready(main);