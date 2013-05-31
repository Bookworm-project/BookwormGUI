/***
@title:
Feedback Tab

@version: 1.0

@author:
David Tang

@date:
2010-11-24 - plugin released

@url
www.david-tang.net

@copyright:
2010 David Tang

@requires:
jQuery

@does:
Created a Feedback tab on the side of your page using Javascript. Tested in IE7, IE8, Chrome, Safari, and Firefox

@howto:
visit www.david-tang.net

*/

(function(){
	jQuery.fn.feedback = function(options){
		
		var defaults = {
			'mouseoverColor': '#ff0000',
			'mouseoffColor': '#222222',
			'position': 'right'
		}
		
		return this.each(function(){
			
			//defaults  object extends options object
			options = jQuery.extend(defaults, options);
			
			var obj = jQuery(this);
			var theWindow = jQuery(window);
			
			function hoverOn() {obj.css('background-color', options.mouseoverColor);}
			function hoverOff() {obj.css('background-color', options.mouseoffColor);}
			
			obj.bind('mouseover', function(){hoverOn();});
			obj.bind('mouseout', function(){hoverOff();});
			obj.css('background-color', options.mouseoffColor); //set the intial background color on page load
			
			//provided image dimensions: image width=30, height=100
			function positionElement(){
				var elementWidth = obj.outerWidth();
				var elementHeight = obj.outerHeight();
				var windowWidth = theWindow.width();
				var windowHeight = theWindow.height();	
				
				if(options.position == "right"){
					var X2 = windowWidth*2/3-elementWidth;
				}
				else if(options.position == "left"){
					var X2 = 0;
				}			
				
				var Y2 = 0;
				
				X2 = X2 + "px";
				Y2 = Y2 + "px"; 
				obj.css({
					'left':X2,
					'top':Y2,
					'position':'fixed'
				});						
			} //end of positionElement function
			
			positionElement(); //position the element on page load
			
			//bind various event handlers to mouseover, mouseoff, and window resize events
			theWindow.bind('resize',function(){
				positionElement();
			});
									
		}); //end of return this.each
	};
})(jQuery);

//Plugin Authoring Documentation: http://docs.jquery.com/Plugins/Authoring
