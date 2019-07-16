jQuery(document).ready(function($){
	const apiUrl = 'http://www.mocky.io/v2/5d1c07823400005200b5fae7';

	//Fetch customer stories from API
	fetchStoriesByAjax(apiUrl);

    //Toggle filter dropdown
    toggleFilter();

    // Filter bar toggle for mobile screens
    mobileFilterToggle();

    // Filter functionality
    doFilterSelections();

    //Clear selected items 
    clearSelection();
});

/*
* Description : Ajax function call to fetch data from API
*/
function fetchStoriesByAjax(apiUrl){
	const storiesWrapper = $('#stories');

	$.ajax({
        url: apiUrl,
        contentType: "application/json",
        dataType: 'json',
        success: function(result){

            var story = "";

            jQuery.each(result, function(index, item){
            	var companyName = item.company_name;
            	var companyExcerpt = item.excerpt;
            	var companyImage = item.image_url;
            	var readTime = readingTime(item.word_count);
            	var companyIndustry = item.industry;
            	var companyLocation = item.location;
            	var companySize = item.company_size;
            	var companyUseCase = item.use_case.join();

            	story += "<div class='col-12 col-md-6 col-lg-4 story-col' data-industry='"+companyIndustry+"' data-location='"+companyLocation+"' data-company_size='"+companySize+"' data-use_case='"+companyUseCase+"'> <div class='story-block'>";
            	story += "<div class='customer-image'><img src='"+companyImage+"' alt='"+companyName+"'></div>";
            	story += "<p>"+companyExcerpt+"</p>";
            	story += "<a href='' class='read-more-link'>Read more <img src='assets/img/arrow.svg' alt='read more'></a>";
            	story += "<div class='read-time'><i class='fas fa-clock'></i>"+readTime+" MIN READ</div>";
            	story += "</div></div>";

            });

            storiesWrapper.html(story);

            // Display deduped list of industries
	  		getFilterValues(result, "industry");

	  		//Display deduped list of locations
		  	getFilterValues(result, 'location');

		  	//Display deduped list of company size
		  	getFilterValues(result, 'company_size');

		  	//Display deduped list of use cases
		  	getFilterValues(result, 'use_case', 1);


        }
    });
}

/*
* Description : Function to fetch deduped array from API data
*/
function getFilterValues(arrayMap, filterKey, isConcat = 0){
	var dedupedArr = arrayMap.map(function(arr){
  		return arr[filterKey];
  	});
  	if(isConcat == 1){
  		dedupedArr = dedupedArr.reduce(function(pre, cur){
	  		return pre.concat(cur);
	  	});
  	}
  	dedupedArr = dedupedArr.filter((value, index)=>{
  		return dedupedArr.indexOf(value) === index ;
  	});
  	var count =0;
  	dedupedArr.forEach(function(item, index){

  		count = arrayMap.reduce(function(n, val) {
  			if(isConcat == 1){
  				n = n + (jQuery.inArray(item, val[filterKey]) >= 0);
  			}else{
			    n = n + (val[filterKey] === item);
			}

		    return n;
		}, 0);
  		var itemClassName = item.toLowerCase().replace(/\s/g, '-');
  		$('#'+filterKey).find('ul.options').append('<li data-value="'+item+'"><input type="checkbox" name="chk_'+filterKey+'" id="chk_'+filterKey+'_'+index+'" value="'+item+'"> <label for="chk_'+filterKey+'_'+index+'">'+item+' (<span class="count">'+count+'</span>)</label></li>');
  	});
  	
}

/*
* Description : Calculate reading time based on total words
*/ 

function readingTime(totalWords){
	const wordsPerMinute = 200;
	const minutes = totalWords / wordsPerMinute;
	const readTime = Math.ceil(minutes);

	return readTime;
}

/*
* Description : Toggle filter bar dropdpowns
*/

function toggleFilter(){

	$('.filter-option').on('click', function(){
    	$('.cat-block').removeClass('active');
    	if($(this).find('.cat-block').css('opacity') == 1){
			$(this).find('.cat-block').removeClass('active');
    	}else{
			$(this).find('.cat-block').addClass('active');
    	}
	});
}

/*
* Description : Mobile Toggle filter bar 
*/
function mobileFilterToggle(){

    jQuery('.mobile-refine-by').on('click', function(){
		jQuery('.filter-wrapper').slideToggle();
	});	
}

/*
* Description : Function to do work on clicking filter item
*/
function doFilterSelections(){
	setTimeout(function(){
		jQuery('.cat-block ul.options li').on('click', function(){

			//Call function to update checked items count
			updateSelectedItemsCount($(this));

			//function to do filter magic			
			actualFilter();
		});
	}, 500);
}

/*
* Description : Get an array of values of checked filter options
*/
function fetchCheckedFilterItems(itemName){
	var checkedOptions = [];

	jQuery('#'+itemName+' input[type="checkbox"]:checked').each(function(){
		checkedOptions.push( $(this).val());
	});
	return checkedOptions;
}

/*
* Description : Function that filters the items based on selections
*/
function actualFilter(){
	var selectedIndustry = fetchCheckedFilterItems('industry');
	var selectedLocation = fetchCheckedFilterItems('location');
	var selectedCompanySize = fetchCheckedFilterItems('company_size');
	var selectedUseCase = fetchCheckedFilterItems('use_case');

	jQuery('.story-col').removeClass('activeItem').addClass('hideItem').filter(function(){
		
		regIndustry = new RegExp("("+selectedIndustry.join('|')+")", "ig");
		
		regLocation = new RegExp("("+selectedLocation.join('|')+")", "ig");
		
		regCompanySize = new RegExp("("+selectedCompanySize.join('|')+")", "ig");
		
		regUseCase = new RegExp("("+selectedUseCase.join('|')+")", "ig");
		
		var returnExp = (
				jQuery(this).attr('data-industry').match(regIndustry) &&
				jQuery(this).attr('data-location').match(regLocation) &&
				jQuery(this).attr('data-company_size').match(regCompanySize) &&
				jQuery(this).attr('data-use_case').match(regUseCase)
		);

		return returnExp;
	}).addClass('activeItem').removeClass('hideItem');
}

/*
* Description : Function to clear selected filter options when Clear link is clicked in filter dropdown
*/
function clearSelection(){
	jQuery('.cat-block .clear-selected').on('click', function(e){
		e.preventDefault();

		$(this).parents('.cat-block').find('input[type="checkbox"]').prop('checked', false);

		//Call function to update checked items count
		updateSelectedItemsCount($(this).parents('.cat-block').find('ul.options li'));

		//Run filter function again
		actualFilter();
	})
}

/*
* Description : Function that updates selected item count and background of selected item
*/
function updateSelectedItemsCount(listItem){

	var checkedCount = listItem.parent('ul').find('input[type="checkbox"]:checked').length;
	if(checkedCount > 0){
		listItem.parents('.cat-block').find('.selected-count span').text(checkedCount).parents('.selection-clear').slideDown();
	}else{
		listItem.parents('.cat-block').find('.selection-clear').slideUp();
	}

	//Toggle background color for selected filter
	if(listItem.find('input[type="checkbox"]').is(':checked')){
		listItem.addClass('selected');
	}else{
		listItem.removeClass('selected');
	}
}
