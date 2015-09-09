var root = null;
var divs = null;
var num = 0;
var index = 0;
var targetTop = 0;

var HLBack = null;
var relateDiv = null;
var initLeft = 0;
var initWidth = 0;

var rDivWidthWrap =0;
var rDivHeightWrap =0;

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
	initRDiv();

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

	/*6. User Defined Relationship : Init relateDiv, fill it, & inset into DOM */
	relateDiv = $("<div/>", {class: "relateDiv"});
	relateDiv.append( $('<div/>'));

	var fillRelateDiv = function( RDiv ){
		/*S1: Get Footnote, remove from DOM & insert into relateDiv */
		var FN = $('div.footnotes');//console.log(FN.size());
		FN.remove();
		FN.find('ol>li').each(function(){
			/* Remove the back link tag */
			// $(this).find('.footnote-backref').parent().remove();
			$(this).find('.footnote-backref').remove();
			lastP = $(this).children('p:last');
			if (!lastP.html().trim()){ lastP.remove(); }
			var temp = $('<div/>',{id: $(this).attr('id'), 'class': 'passive'}).append($(this).html());
			RDiv.children(':first').append(temp);
		});
		
		/* Append mark to items with passive/more contents*/
		$('.footnote-ref').each(function(index, el) {
			var tempLink = $('<a/>',{href: $(this).attr('href'), 'class': 'footnote-passive'});
			tempLink.html(' <span class="ui-icon ui-icon-circle-plus"></span>');
			tempLink = $('<sub/>').append(tempLink);
			$(this).parent().replaceWith(tempLink);
		});

		/*S2: Get Img, replace it with des-list in DOM & insert img into relateDiv */
		var IMG = $('.contentDiv li>div>p>img')
		
		IMG.each(function(index, value) {
			var imgParentDiv = $(this).parent().parent();
			var linkSUB = '<sub><a href="#IMG:NO" class="footnote-active"><span class="ui-icon ui-icon-image"></span></a></sub>'.replace("NO", index);
			$(this).parent().html($(this).parent().text() + '<b>'+$(this).attr('alt')+'</b> '+  linkSUB );
			$(this).remove();
			var temp = $('<div/>',{id: 'IMG:NO'.replace("NO", index), 'class': 'active'}).append($(this));

		/* 	NO Images marked with # in mdSrc of new syntax, which originally parsered to li>div>img without <p>*/

			/* If authored as shown bottom, then addClass(bottom) to .relateDiv>div>div*/
			if (imgParentDiv.hasClass('bottom')){
				temp.addClass('bottom');
			}
			RDiv.children(':first').append(temp);		
		});
	}
	fillRelateDiv(relateDiv);

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

	/* List items marked with - in mdSrc, parsered to li>div>ul 
		Moved as children of previous li>div*/
	ulItem = root.find('li>div>ul'); //console.log(ulItem.size());
	ulItem.each(function(index, el) {
		liPareTemp = $(this).parentsUntil('li').parent();
		liPareTemp.prev().children().append($(this));
		liPareTemp.remove();		
	});
	
	/* wrap title = ul>li>div:first-child with <p> */
	var firstTitle = root.find('ul>li>div:first-child').first();
	firstTitle.html("".concat("<p>",firstTitle.html(),"</p>"));

	root.find('li>div~ul').parent().children(':first-child').each(function(index, el) {// div
		if($(this).has('p:first-child').size()==0){
			$(this).wrapInner('<p/>'); //console.log($(this).html());
		}		
	});

	/* Items marked with # in mdSrc which has no details, parsered to li>div directly without <p> 
		wrap item with <p>*/
	root.find('li>div:first-child').each(function(){
		if($(this).has('p').size()==0){
			$(this).wrapInner('<p/>');
		}
	});

	/* Find and set ID for title, having special style setting via css */
	$('.L_1 >li:first').attr('id','title');

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
	// HLBack.css("left",base.position().left); // HLBack.css(base.position());

	// HLBack.height(base.outerHeight());
	var borderTemp = base.outerHeight()-base.height();
	HLBack.height(temp+borderTemp);
	// HLBack.width(base.outerWidth());
}

var initWrap = function(){
	/* The whole .contentWrap should be in the center of the screen*/
	initLeft = ($('body').outerWidth()-$('.contentWrap').outerWidth())/2;
	$('.contentWrap').css('left', initLeft );
	initWidth = $('.contentWrap').width();
}

var configWrap = function(target){
	var left = initLeft;
	var width = initWidth;

	/* Only .relateDiv>target with location=right may change margin-left andwidth of .cotentDiv*/
	if (target != null && target.attr('location') == 'right') {
		var rDivWnew = target.width()+rDivWidthWrap;
		if (target.attr('id').match(/^IMG:/)){
			rDivWnew = target.children().width()+rDivWidthWrap;
		}
		var left = initLeft - rDivWnew/2;

		if (left < 0  ){ // relateDiv.width > initleft*2
			left = 0;
			width = $('.container').offset().left +$('.container').outerWidth() - rDivWnew;
		}
	}
	return {left:left, width:width};
}

var scale = function(IMG, maxW, maxH, factor){
	/* set width&height of IMG limited by different valid sizes and requirements/factor*/
	var origW = IMG.get(0).naturalWidth; 
	var origH = IMG.get(0).naturalHeight;
	var ratio = origW/origH;
	if ( ratio > maxW/maxH ) {
		IMG.width(maxW*factor);
		IMG.height(maxW*factor/ratio);
	} else {
		IMG.width(maxH*factor * ratio);
		IMG.height(maxH*factor);
	}
}

var initRDiv = function () {
	/*	Init size of divs in .realteDiv differently, since right/bottom have differet valid space,
		- passive v.s. active ; right v.s. bottom 
		- NO need to init .relateDiv.position().left/top */
	relateDiv.find("div >div.bottom").each(function(index, el) {
		$(this).attr('location','bottom');
	});
	relateDiv.find("div >div:not(.bottom)").each(function(index, el) {
		$(this).attr('location','right');
	});

	/* Calculate Valide Space : Need updated HLBack, so require initHLB(firstHL) must before initRDiv() */
	var cDivWidthMin = parseInt($('.contentWrap').css('min-width'), 10);
	var rDivBoxWidth = relateDiv.outerWidth(true)-relateDiv.width() + parseInt($('.relateDiv >*').css('padding-left'))*2;
	var rDivValidWidth = $('.container').outerWidth()- cDivWidthMin - rDivBoxWidth;
	var rDivValidHeight = $('.container').height() - (HLBack.offset().top + HLBack.outerHeight(true)); 

	/*Must set size for EVERY div.passive/active, and hide()
	  - ALL .passive shown in right, but max-width is different
	  - only set width for .right, while only set height for .bottom*/
	relateDiv.find('.passive').css('max-height', $('.container').height());
	relateDiv.find('div >div').each(function(index, el) {
		if ($(this).hasClass('passive')){ //passive & all are location=right
			$(this).css('width', Math.min($('.container').width()*0.4, rDivValidWidth, $(this).width())); // ?
			$(this).css('height', $(this).height()); // ?

		} else { //hasClass('active')
			/* SET $(this).height/width for every image-active in relateDiv via img.onload()*/
			if ( $(this).attr('id').match(/^IMG:/)) {
				$(this).children().load(function() { 					
					var IMG = $(this); //img
					var origWidth = IMG.get(0).naturalWidth; 
					var origHeight = IMG.get(0).naturalHeight;

					var imgLoc = $(this).parent().attr('location');
					if (imgLoc == 'right'){
						if(origWidth>rDivValidWidth || origHeight > $('.container').height()) {
							scale(IMG, rDivValidWidth, $('.container').height(), 1);
						} else {
							IMG.css("width",origWidth);
							IMG.css("height",origHeight);
						}
					} else if(imgLoc == 'bottom'){
						if(origHeight>rDivValidHeight || origWidth > $('.container').width()) {
							scale(IMG, $('.container').width(),rDivValidHeight, 1);
							/* May need to check height with $(.container).height()	*/
						} else {
							IMG.css("width",origWidth);
							IMG.css("height",origHeight);
						}
					} else {
						console.log('Other Location');
					}

					console.log(IMG.parent().attr('id'),imgLoc, 'original is ',origWidth, origHeight,
							 'parent used to be', IMG.parent().width(), IMG.parent().height(), 'reset to', IMG.width(), IMG.height() );
				}); // end of onload() to reset height/width
			} else{ 
				console.log("GOT Active but NOT IMG!");
			}
		}

		/* $(this) = relateDiv.find('div >div') */
		$(this).hide();
	});

	/* rDivWidth/HeightWrap is used by configWrap() & setRDivLeft/Top() */
	rDivWidthWrap = relateDiv.outerWidth(true) - relateDiv.width()+parseInt(relateDiv.css('margin-left'))*2;
	rDivHeightWrap = relateDiv.outerHeight(true) - relateDiv.height();
	relateDiv.hide();
}

var hasRDiv = function(item, mode){
	var target = null;
	
	/* mode = 'active'|| 'passive' */
	var relateLI = item.find('sub>a.footnote-'+mode);

	/*	If relateLI is null, then no related, so target will be kept as null;
		else, NOT Null, target will be updated as .relateDiv>div>div
		?? What if has more than one target, i.e., relateLI.size() >1 ??*/
	relateLI.each(function() {
		target = $($(this).attr('href').replace(':', '\\:'));
	});

	return target;
}

var setRDivLeft = function(target, cDiv){
	if (target == null) return;/* target must NOT null, since has been checked outside before this called*/
	var newLeft = 0;
	if (target.attr('location') == 'bottom'){//target.attr('location') == 'bottom'
		var rDivWnew = target.width()+rDivWidthWrap;
		if (target.attr('id').match(/^IMG:/)){
			rDivWnew = target.children().width()+rDivWidthWrap;
		}
		newLeft = ($('.container').outerWidth()-rDivWnew)/2 ;
	} else {// location == right
		newLeft = $('.container').offset().left +cDiv.left + cDiv.width -2;
	}
	
	newLeft = newLeft< - parseInt(relateDiv.css('margin-left'))*2 ? - parseInt(relateDiv.css('margin-left'))*2 : newLeft;
	relateDiv.css('left', newLeft);// relateDiv.animate({left:newLeft},'slow');
}
var setRDivTop = function(target, HLHeight){
	if (target == null) return;/* target must NOT null, since has been checked outside before this called*/
	var newTop = 0;
	if (target.attr('location') == 'bottom'){
		newTop = HLBack.offset().top + HLHeight;
		console.log(HLBack.position().top, HLBack.offset().top)
	} else {// location == right
		var rDivWnew = (target.height()+rDivHeightWrap);
		if (target.attr('id').match(/^IMG:/)){
			rDivWnew = (target.children().height()+rDivHeightWrap);
		}
		newTop = HLBack.offset().top + HLHeight/2 - rDivWnew/2;
		console.log(rDivWnew, target.height(), target.children().height());
	}

	newTop = newTop< - parseInt(relateDiv.css('margin-top')) ? - parseInt(relateDiv.css('margin-top')) : newTop;
	relateDiv.css('top', newTop);//relateDiv.animate({top:newTop},'slow');
}

var hideRDiv = function(){ // relateDiv.hide('slow');
	/* 	Must hideRDiv() when .highlight is changed, since the locations of relateDiv are vairous and may cause confused animation*/
	if ($('.hlSupport').attr('location') == 'bottom'){
		relateDiv.effect('slide', { direction: 'up', mode: 'hide' }, 'slow');
	} else {
		relateDiv.effect('slide', { direction: 'right', mode: 'hide' }, 'slow');
	}
}
var showRDiv = function(target){ // relateDiv.show('slow');
	if (target == null) return;/* target must NOT null, since has been checked outside before this called*/
	if ($('.hlSupport').attr('id') != target.attr('id') ){
		$('.hlSupport').hide()
		$('.hlSupport').removeClass('hlSupport');
		target.addClass('hlSupport');
		target.show();
	}

	if (target.attr('location') == 'bottom'){
		relateDiv.effect('slide', { direction: 'up', mode: 'show' }, 'slow');
		$('.highlight').height($('.highlight').height() + relateDiv.outerHeight()); // Add height for active bottom
	} else {
		relateDiv.effect('slide', { direction: 'left', mode: 'show' }, 'slow');
	}
}

var setHeight = function(object, mode){
	var temp = 0;
	
	if (mode === "one-line") {
	/* shrink, NOT highlight */ /*---v4-6--new one-line height-------*/
		temp = object.next().children().outerHeight();
	} else if (mode === "full") {
	/* expand, IS highlight */
		if(object.children().first().attr('class')=="MathJax_Preview"){
		/* for set  'MathJax' in highlight */
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
	if (mode == 'more') {
		/* if mode == more, then unit==0, so expand = #item(index+0) = current highlight*/
		var current = divs.eq(index+unit);
		var passiveTarget = hasRDiv(current,'passive');
		
		/* NO passive, then nothing to do*/
		if (passiveTarget) {
			/*	If .passive is already shown, then action is to hide it
				And must set target to null, for correct configWrap() and other update*/
			if (passiveTarget.css('display')!='none' && relateDiv.css('display')!='none') {
				hideRDiv();
				passiveTarget = null;
			};

			var updatedCDiv = configWrap(passiveTarget);
			$('.contentWrap').animate({left:updatedCDiv.left, width:updatedCDiv.width },'slow', function(){
				var fullH = setHeight(current, "full");
				
				// Update postion of relateDiv and show
				if (passiveTarget){
					setRDivLeft(passiveTarget, updatedCDiv);
					setRDivTop(passiveTarget, fullH);
					showRDiv(passiveTarget);				
				}
				updateHLB(current, fullH);
			});	
		};	
		return 0
	};
	if (unit == 0){	return 0; }
	/* Only need to change .highlight when mode!=more && unit>0*/
	var shrink = divs.eq(index);
	var expand = divs.eq(index+unit);

	/* Get original position.top for computing $revise and other use later */
	/* !! Must Before reset .highlight */
	var shrinkOldHeight = shrink.height();
	var shrinkTop = $('.hlBackground').position().top;
	var expandTop = expand.position().top;

	var activeTarget = hasRDiv(expand,'active');
	hideRDiv();/* Must hideRDiv() when .highlight is changed to avoid confused animation*/

	var scroll = function(){
		//5 change .HL /* Reset .highlight target : change from shrink to expand */
		shrink.removeClass('highlight');
		expand.addClass('highlight');

		//6 setHeight()	/*1. Expand & Shrink : via resetting height */
		var oneLineH = setHeight(shrink, "one-line");
		var fullH = setHeight(expand, "full");	

		//7-8 Update position of relateDiv and show
		if (activeTarget) {
			setRDivLeft(activeTarget,updatedCDiv);
			setRDivTop(activeTarget, fullH);
			showRDiv(activeTarget);
		};

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
		targetTop = root.scrollTop();
		targetTop += reviseTop;
		root.animate({scrollTop:targetTop},'slow');
	}

	var updatedCDiv = configWrap(activeTarget);
	(activeTarget == null) && (relateDiv.css('display') == 'none') ? scroll() 
			: $('.contentWrap').animate({left:updatedCDiv.left, width:updatedCDiv.width },'slow', function(){
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
		var unit = 0, mode = 'key';	
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
				} else{/* When reach last item, then next will be 1st title*/
					unit = -index;
					$('.L_1').children().last().children('ul').slideUp();
				}				
				break;
			case 40:// Down : >0 	
				event.preventDefault();
				var childrenSize = divs.eq(index).siblings('ul,ol').find('li>div:first-child').size();
				unit = 1 + childrenSize;
				if (index+unit > num-1) {
					//unit = 0;
					/* When reach last item, then next will be 1st title*/
					unit = -index;
					$('.L_1').children().last().children('ul').slideUp();
				};			
				break;
			case 32:
				event.preventDefault();
				unit = 0;
				mode = 'more';
				break;
		}; // END -- switch
		
		triggerAnimate(unit,mode);
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