function get_short_google_url(long_url, api_key, func)
{
	// NOTE - This is the Public API Key - can only be called from
	// specific domain addresses and must be registered
	var apiKey = 'AIzaSyCZbPUOC1gp9StPK-TZ7Zzw2vcpLK7Ja70';
	gapi.client.setApiKey(apiKey);
	
	gapi.client.load('urlshortener', 'v1', function() {
	    var request = gapi.client.urlshortener.url.insert({
	        'resource': {
	            'longUrl': long_url
	        }
	    });
	    var resp = request.execute(function(resp) {
	        if (resp.error) {
	            alert(resp.error.message);
	        } else {
	        	func(resp.id);
	        }
	    });
	});
}

function updateTwitterValues(share_url, title) {

	get_short_google_url(share_url, "AIzaSyCZbPUOC1gp9StPK-TZ7Zzw2vcpLK7Ja70", function(short_url) {
		$('#tweet_container').html('&nbsp;');
		$('#tweet_container').html('<a href="https://twitter.com/share" class="twitter-share-button" data-url="' + short_url +'" data-size="large" data-text="' + title + '" data-count="none">Tweet</a>');
		twttr.ready(function(twttr) {
			twttr.widgets.load();                });
	});

	var request = gapi.client.urlshortener.url.insert({ 
		'resource': {'longUrl': 'http://www.godaddy.com'} 
	}); 

	alert(request);

}