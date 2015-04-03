function get_short_google_url(long_url, func)
{
	// NOTE - This is the Google Developer Public API Key - can only be called from
	// specific domain addresses and must be registered as an application
	var apiKey = 'AIzaSyAeMWvbpyg19qXOvkwNZZK1q0tXrZ6Z90Q';
	
	if(gapi.client != "undefined" && gapi.client){
		gapi.client.setApiKey(apiKey);
		gapi.client.load('urlshortener', 'v1', function() {
			var request = gapi.client.urlshortener.url.insert({
				'resource': {
					'longUrl': long_url
				}
			});
			var resp = request.execute(function(resp) {
				if (resp.error) {
	            console.log(resp.error.message);
	        } else {
	        	func(resp.id);
	        }
	    });
		});
	}
	else{
		func("http://goo.gl/NjxlF4");
	}


}

function updateTwitterValues(share_url, title) {
	try{
		get_short_google_url(share_url, function(short_url) {
			$('#tweet_container').html('&nbsp;');
			$('#tweet_container').html('<a href="https://twitter.com/share" class="twitter-share-button" data-url="' + short_url +'" data-size="large" data-text="' + title + '" data-count="none">Tweet</a>');
			twttr.ready(function(twttr) {
				twttr.widgets.load();
			});
		});
	}
	catch(err){
		console.log(err.message);
	}
}
