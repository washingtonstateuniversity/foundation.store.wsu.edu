
<!-- TYPEKIT -->
  (function(d) {
    var config = {
      kitId: 'nww0uto',
      scriptTimeout: 3000
    },
    h=d.documentElement,t=setTimeout(function(){h.className=h.className.replace(/\bwf-loading\b/g,"")+" wf-inactive";},config.scriptTimeout),tk=d.createElement("script"),f=false,s=d.getElementsByTagName("script")[0],a;h.className+=" wf-loading";tk.src='//use.typekit.net/'+config.kitId+'.js';tk.async=true;tk.onload=tk.onreadystatechange=function(){a=this.readyState;if(f||a&&a!="complete"&&a!="loaded")return;f=true;clearTimeout(t);try{Typekit.load(config)}catch(e){}};s.parentNode.insertBefore(tk,s)
  })(document);

(function($){
	"use strict";
	$(document).ready(function(){
		//$( document ).tooltip();
			
		$.each($(".regular-price"), function(){
			$(this).data("price",$(this).text().replace('$',''));
		});
		
		function int_addGuest(){
			$('.add_guest').off().on('click',function(e){
				
				e.preventDefault();
				e.stopPropagation();
				
				var _block = $(this).closest(".item");
				
				_block.find(".template").clone().appendTo(_block.find('.guest_blocks')).removeClass("template");
				var guest_count = _block.find('.guest_block:not(.template)').length;
				var block_content = _block.find('.guest_block').last().html().toString();
				//alert(block_content);
				_block.find('.guest_block').last().html( block_content.replace(/{%d%}/gim, guest_count) );
				$(this).hide();
				_block.find(".price").text(  currencyFormat( _block.find(".regular-price").data("price")*( guest_count+1) ) );
				_block.find('[name$="[qty]"]').val(guest_count+1);
				var limit = _block.find('.guest_blocks').data('limit');
				if(limit=="unlimited" || limit<guest_count){
					int_addGuest();
				}else{
					_block.find('.add_guest').hide();
				}
				int_removeGuest();
			});
		}

		function int_removeGuest(){
			$('.remove_guest').off().on('click',function(e){
				e.preventDefault();
				e.stopPropagation();
				
				var _block = $(this).closest(".item");
				
				$(this).closest(".guest_block").remove();
				
				$.each(_block.find('.guest_block:not(.template)'), function(i,v){
					var adj_i =i+1;
					$(this).find(".count").text( adj_i );
					$(this).html( $(this).html().toString().replace(/\[guest\]\[\d+?\]/gmi, "guest["+adj_i+"]") );
				});
				var guest_count = _block.find('.guest_block:not(.template)').length;
				_block.find(".price").text( currencyFormat( _block.find(".regular-price").data("price")*( guest_count+1) ) );
				_block.find('[name$="[qty]"]').val(guest_count+1);
				/*if(guest_count<=0){
					_block.find('.add_guest').show();
				}else{
					_block.find('.add_guest').last().show();
				}*/_block.find('.add_guest').last().show();
				int_addGuest();
				int_removeGuest();
			});
		}

		$.fn.int_guest_display = function() {
			$.each($(this),function(){
				$(this).find('.guest_blocks').show();
				
				if($('.guest_block').is($(':visible')) && !($(this).has( $('.guest_block').is($(':visible'))) )  ){
					$(this).find('.copy_guest').addClass('can_copy');
					$('.can_copy').on('click',function(){
						//$('')
					});
				}
			});
		};
		$.fn.destroy_guest_display = function() {
			$.each($(this),function(){
				var _block =$(this);
				
				var guest_count = 0;
				
				_block.find(".guest_block:not(.template)").remove();
				_block.find(".price").text(  currencyFormat( _block.find(".regular-price").data("price")*( guest_count+1) ) );
				_block.find('[name$="[qty]"]').val(guest_count+1);
				
				_block.find('.guest_blocks').hide();
				_block.find('.add_guest').show();
				_block.find('.copy_guest').removeClass('can_copy');
			});
		};

		$.fn.int_access_validation = function() {
			var _block =$(this);
			if( _block.is($('.passed')) ){
				return true;	
			}else{
				_block.addClass('active');
				_block.find('.access_form input').focus();
				_block.find('.access_form input').on('keyup',function(){
					if($(this).val() === $(this).data('valid')){
						_block.find('.access_form input').blur();
						$('.access_form').html('<h4>Adding to your cart.</h4>');
						
						window.setTimeout(function(){
							_block.fadeOut(250,function(){
								_block.removeClass('active');
								_block.addClass('passed');
								_block.closest('.mass_item').find('.button.btn-cart').trigger('click');
							});
						}, 250);

					}
				});
				return false;
			}
		};

		$('.button.btn-cart').off().on('click',function(e){
			e.preventDefault();
			e.stopPropagation();
			var but = $(this);
			var tar = but.closest('.mass_item').find('[name="goingToEvent"]');
			if( tar.is($(":checked")) ){
				but.closest('.mass_item').destroy_guest_display();
				tar.attr('checked',false);
				but.html('<span><span>Attend</span></span>');
				but.closest('.mass_item').removeClass('active_item');
				
			}else{
				if( but.closest('.mass_item').find('.validation_overlay').length<=0 || but.closest('.mass_item').find('.validation_overlay').int_access_validation()){
					tar.attr('checked',true);
					but.html('<span><span>Don\'t Attend</span></span>');
					but.closest('.mass_item').addClass('active_item');
					but.closest('.mass_item').int_guest_display();
					int_addGuest();
					$('.tooltip').tooltip();
				}
			}
		});


//note this will be moved out to the eventticket ext as a dependent of cart ajax handler
		$('#check_out_products').on('click',function(e){
			e.preventDefault();
			e.stopPropagation();
			var formData = $('#mass_products')
							.find('.mass_item.item:has([name="goingToEvent"]:checked) :input:not(.template > :input)')
							.serialize();
							
			$.popup_message("<h4><i class='fa fa-spinner fa-spin'></i> Processing</h4>",true);
			$.post('/cartajax/cartajax/add/?cartAjaxUsed=1',formData,function(data){
					var data_res = jQuery.parseJSON(data);
					console.log( data_res );
					if(data_res.status=="ERROR" || data_res.checkout==""){
						$( "#mess" ).dialog( "destroy" );
						$( "#mess" ).remove();
						$.popup_message("Issue with order"+data_res.message,false);
					}else{
						window.location = '/onepage/';
					}
			}).fail(function(err){ 
				if(e.status == 404){
					// ...
				} else{
					// ...
				} 
				$( "#mess" ).dialog( "destroy" );
				$( "#mess" ).remove();
				$.popup_message("ERR:"+err.status+" | Please try again, and report any issues.",false);
			});
		});	
	});
})(jQuery);