


(function($){

	function int_alertGuest(_block){
		$.each(_block.find('.guest_block:not(.template)'),function(){
			var _guestblock = $(this);
			_guestblock.find('[data-ptype="adult"],[data-ptype="child_6_12"],[data-ptype="under_5"]').off().on('click',function(e){
				
				//e.preventDefault();
				//e.stopPropagation();
				var guest_count = _block.find('.guest_block:not(.template)').length;
				var normal_price=_block.find(".regular-price").data("price")*( guest_count+1);
				if(_block.find('[data-ptype="child_6_12"]:checked').length>0){
					var alter = _block.find('[data-ptype="child_6_12"]:checked').length;
					normal_price -= alter*10;
				}
				if(_block.find('[data-ptype="under_5"]:checked').length>0){
					var alter = _block.find('[data-ptype="under_5"]:checked').length;
					normal_price -= alter*25;
				}
				var under_5_i = _block.find('[data-ptype="under_5"]:checked').length;
				_block.find('[data-cusop="under_5"]').val( under_5_i>0?under_5_i:"" );
				var child_6_12_i = _block.find('[data-ptype="child_6_12"]:checked').length;
				_block.find('[data-cusop="child_6_12"]').val( child_6_12_i>0?child_6_12_i:"" );
				_block.find(".price").text( $.currencyFormat( normal_price ) );
			});
		});
	}



	function int_addGuest(){
		$('.add_guest').off().on('click',function(e){
			
			e.preventDefault();
			e.stopPropagation();
			
			var _block = $(this).closest(".item");
			var _guestblock = _block.find('.guest_block:not(.template)').last();

			
			_block.find(".template").clone().appendTo(_block.find('.guest_blocks')).removeClass("template");
			var guest_count = _block.find('.guest_block:not(.template)').length;
			var block_content = _block.find('.guest_block').last().html().toString();
			//alert(block_content);
			_block.find('.guest_block').last().html( block_content.replace(/{%d%}/gim, guest_count) );
			$(this).hide();
			
			
			int_alertGuest(_block);
			_block.find('[data-ptype="adult"]:checked').trigger('click');// this is starting it since it's the first run.. dirty yes but works

			_block.find('[name$="[qty]"]').val(guest_count+1);
			var limit = _block.find('.guest_blocks').data('limit');
			if( (limit=="unlimited" || limit<guest_count) ){
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
				//$(this).html( $(this).html().toString().replace(/\[guest\]\[\d+?\]/gmi, "guest["+adj_i+"]") );
				$.each($(this).find('[name*="[guest]["]'), function(){
					var name=$(this).attr('name');
					name=name.replace(/\[guest\]\[\d+?\]/gmi, "guest["+adj_i+"]");
					$(this).attr('name',name);
				});
				
				
				
				
				
			});
			var guest_count = _block.find('.guest_block:not(.template)').length;
			
			var normal_price=_block.find(".regular-price").data("price")*( guest_count+1);
			
			
			if(_block.find('[data-ptype="child_6_12"]:checked')){
				var alter = _block.find('[data-ptype="child_6_12"]:checked').length;
				normal_price -= alter*10;
			}
			if(_block.find('[data-ptype="under_5"]:checked')){
				var alter = _block.find('[data-ptype="under_5"]:checked').length;
				normal_price -= alter*25;
			}
			var under_5_i = _block.find('[data-ptype="under_5"]:checked').length;
			_block.find('[data-cusop="under_5"]').val( under_5_i>0?under_5_i:"" );
			var child_6_12_i = _block.find('[data-ptype="child_6_12"]:checked').length;
			_block.find('[data-cusop="child_6_12"]').val( child_6_12_i>0?child_6_12_i:"" );
			
			_block.find(".price").text( $.currencyFormat( normal_price ) );
			
			
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
	
	
	$(document).ready(function(){
		//$( document ).tooltip();
			
		$.each($(".regular-price"), function(){
			$(this).data("price",$(this).text().replace('$',''));
		});
		
		



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
				_block.find(".price").text(  $.currencyFormat( _block.find(".regular-price").data("price")*( guest_count+1) ) );
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
		$.fn.int_guestcounter = function() {
			var _block =$(this);
			var input = _block.find('.spinner');
			if(input.length){
				var spinner = input.spinner({
					min: 0,
					change: function(){
							var guest_count = parseInt(input.val());
							_block.find(".price").text(  $.currencyFormat( _block.find(".regular-price").data("price")*( guest_count+1 ) ) );
							_block.find('[name$="[qty]"]').val(guest_count+1);
						},
					stop: function(){
							var guest_count = parseInt(input.val());
							_block.find(".price").text(  $.currencyFormat( _block.find(".regular-price").data("price")*( guest_count+1 ) ) );
							_block.find('[name$="[qty]"]').val(guest_count+1);
						}
					}).blur(function () {
						var value1 = input.val();
						if (value1<0) {
							input.val(0);
						}
						if(isNaN(value1)) {
							input.val(0);
						}
					});
			}
		}
		
		
		$('#check_out_products').fadeOut();
		$(window).on("scroll",function(){
			 if (jQuery(this).scrollTop()+jQuery(this).height() > (jQuery('footer').offset().top+25) ) {
				$('#check_out_products').removeClass('fixed');
			} else {
				$('#check_out_products').addClass('fixed');
			}
		}).trigger("scroll");
		$(window).on("resize",function(){
			$("#check_out_products").css({"width":($(".mass_item").width()-18)+"px"});
		}).trigger("resize");

		$('.button.btn-cart').off().on('click',function(e){
			e.preventDefault();
			e.stopPropagation();
			var but = $(this);
			var item = but.closest('.mass_item');
			var tar = item.find('[name="goingToEvent"]');
			if( tar.is($(":checked")) ){
				item.destroy_guest_display();
				tar.attr('checked',false);
				but.html('<span><span>Attend</span></span>');
				item.removeClass('active_item');
				if($('[name="goingToEvent"]:checked').length<=0 && $('#check_out_products').is(':visible')){
					$('#check_out_products').fadeOut();
				}

			}else{
				if( item.find('.validation_overlay').length<=0 || item.find('.validation_overlay').int_access_validation()){

					tar.attr('checked',true);
					but.html('<span><span>Don\'t Attend</span></span>');
					item.addClass('active_item');
					item.int_guest_display();
					item.int_guestcounter();
					int_addGuest();
					$('.tooltip').tooltip();
					
					if($('[name="goingToEvent"]:checked').length){
						$('#check_out_products').fadeIn();
						$(window).on("resize",function(){
							$("#check_out_products").css({"width":($(".mass_item").width()-18)+"px"});
						}).trigger("resize");
					}
					
					
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
					//console.log( data_res );
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
	
	
	//<!-- TYPEKIT -->
  (function(d) {
    var config = {
      kitId: 'nww0uto',
      scriptTimeout: 3000
    },
    h=d.documentElement,t=setTimeout(function(){h.className=h.className.replace(/\bwf-loading\b/g,"")+" wf-inactive";},config.scriptTimeout),tk=d.createElement("script"),f=false,s=d.getElementsByTagName("script")[0],a;h.className+=" wf-loading";tk.src='//use.typekit.net/'+config.kitId+'.js';tk.async=true;tk.onload=tk.onreadystatechange=function(){a=this.readyState;if(f||a&&a!="complete"&&a!="loaded")return;f=true;clearTimeout(t);try{Typekit.load(config)}catch(e){}};s.parentNode.insertBefore(tk,s)
  })(document);
	
})(jQuery);