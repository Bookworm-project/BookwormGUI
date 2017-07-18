import React from 'react';
import { BookwormModule } from './bookworm.gui';

class BookwormHeader extends React.Component {

    render() {
        return (
			<div className="row">
				<div id="header">
					<div id="header_brand">
						<h1><a href="http://bookworm.culturomics.org" target="_blank">bookworm:</a>
							<font id="sourceName1"></font></h1>
						<p>
							<span className="subtitle">
							Search for trends in hundreds of thousands of 
							<span className="bw-texttype"></span> at 
							<span id="sourceURL"></span>
							</span>
						</p>
					</div>
				</div>
			</div>
        );
    };
};


class BookwormControls extends React.Component {

    render() {
        return (
            	<div className="row">

		<div className="col-xs-12">

		<ul className="nav nav-pills navbar-right" role="tablist">
			<li role="presentation" className="dropdown">
				<a id="time-drop" href="#" className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
					<span className="glyphicon glyphicon-time"  aria-hidden="true"></span> <span className="hidden-xs">Dates </span><span className="caret"></span>
				</a>
				<ul id="time-drop-menu" className="dropdown-menu" aria-labelledby="time-drop">
					<li className="dropdown-header">Date Limits</li>
					<li><a href="#">
						<div id="year-slider"></div>
						</a></li>
					<li><a href="#"><p id="time-val" style={{width: '210px'}}></p></a></li>
					<li className="dropdown-header">Smoothing</li>				
					<li><a href="#"><div id="smoothing-slider" width="175px"></div></a></li>
					<li><a href="#"><p id="smoothing-val">t</p></a></li>
				</ul>
			</li>
			<li role="presentation" className="dropdown">
				<a id="metric-drop" href="#" className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
					<span className="glyphicon glyphicon-stats"  aria-hidden="true"></span> <span className="hidden-xs">Metric </span><span className="caret"></span>
				</a>
				<ul id="metric-drop-menu" className="dropdown-menu counttype" aria-labelledby="metric-drop">
					<li className="dropdown-header">Metric</li>
					<li data-val="WordsPerMillion" data-label="Words per Million"><a href="#"><span className="glyphicon glyphicon-ok bw-checkmark" aria-hidden="true"></span> Words per Million</a></li>
					<li data-val="TextPercent" data-label="% of Texts"><a href="#"><span className="glyphicon glyphicon-ok bw-checkmark" aria-hidden="true"></span> Percent of <span className="bw-texttype">Text</span></a></li>
					<li data-val="WordCount" data-label="Number of Words"><a href="#"><span className="glyphicon glyphicon-ok bw-checkmark" aria-hidden="true"></span> Number of Words</a></li>
					<li data-val="TextCount" data-label="Number of Texts"><a href="#"><span className="glyphicon glyphicon-ok bw-checkmark" aria-hidden="true"></span> Number of <span className="bw-texttype">Text</span></a></li>
				</ul>
			</li>
			<li role="presentation" className="dropdown">
				<a id="case-drop" href="#" className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
					<span className="glyphicon glyphicon-sort"  aria-hidden="true"></span> <span className="hidden-xs">Case </span><span className="caret"></span>
				</a>
				<ul id="case-drop-menu" className="dropdown-menu collationtype" aria-labelledby="case-drop">
					<li className="dropdown-header">Case</li>
					<li data-val="Case_Sensitive"><a href="#"><span className="glyphicon glyphicon-ok bw-checkmark" aria-hidden="true"></span> Case-Sensitive</a></li>
					<li data-val="Case_Insensitive"><a href="#"><span className="glyphicon glyphicon-ok bw-checkmark" aria-hidden="true"></span> Case-Insensitive</a></li>
				</ul>
			</li>

		<li><button className='btn btn-primary search-btn search-bw' rel='tooltip' title='Search the corpus!'>
					<span className="glyphicon glyphicon-search"  aria-hidden="true"></span> Search
			</button></li>
		</ul>

		</div>

		<div className="col-xs-12 col-sm-9 col-md-10" id="search_queries">
		</div>

		<div className="pull-right" className="minor-controls">
			<ul className="nav nav-pills" role="tablist">
			<li role="presentation" className="dropdown">
			<a id="link-drop" href="#" className="dropdown-toggle" data-toggle="dropdown" role="button"  aria-label="Link" aria-haspopup="true" aria-expanded="false" title="Link">
					<span className="glyphicon glyphicon-link"  aria-hidden="true"></span>
				</a>

			<ul id="link-drop-menu" className="dropdown-menu permalink" aria-labelledby="link-drop">
					<li className="dropdown-header">Copy this link</li>
					<li className="dropdown-padding" id="permalink"><input type="text"></input></li>
			</ul>
		</li>

		<li role="presentation" className="dropdown">
			<a id="info-drop" href="#" className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false" title="Info">
					<span className="glyphicon glyphicon-info-sign"  aria-hidden="true"></span>
				</a>

			<ul id="info-drop-menu" className="dropdown-menu" aria-labelledby="info-drop">
				<form className='dropdown-padding'>Bookworm was created by Benjamin Schmidt (Department of History, Northeastern), Matt Nicklay, Neva Cherniavsky Durand, Martin Camacho, and 
					Erez Lieberman Aiden at the <a href="http://www.culturomics.org" target="_blank">Cultural Observatory</a>. It enables you to visually explore lexical trends. 
					Bookworm is hosted through the&nbsp;generous support of the <a href="http://www.opensciencedatacloud.org/" target="_blank">Open Science Data Cloud</a>. 
					If you use it in an academic publication, please include a link to <a href="http://bookworm.culturomics.org/" target="_blank">bookworm.culturomics.org</a>.
				</form>
			</ul>
		</li>

		<li role="presentation" className="dropdown">
			<a id="export-drop" href="#" className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false" title="Export">
					<span className="glyphicon glyphicon-cloud-download"  aria-hidden="true"></span>
				</a>

			<ul id="export-drop-menu" className="dropdown-menu" aria-labelledby="info-drop">
				<li><a href="#" className="bw-export-png">Export PNG</a></li>
				<li><a href="#" className="bw-export-pdf">Export PDF</a></li>
			</ul>
		</li>
		</ul>
		</div>
	</div>

        )

    }

}

class Bookworm extends React.Component {
	componentDidMount() {
		BookwormModule();
	}

    render() {
        return (
            <div>
                <BookwormHeader />
                <BookwormControls />
               	<div className="row">
					<div id="bw-search_error" className="col-xs-12 alert alert-danger"></div>
				</div>
				<div className="row" id="main">
					<div id="container">
						<div id="chart_wrapper">
							<div id="chart"></div>
						</div>
					</div>
            	</div>

            	<div className='row'>
					<div id="social">
						<table cellSpacing="0">
							<tbody><tr>
								<td style={{textAlign: 'right'}}><div id="fb-root"></div></td>
								<td style={{textAlign: 'right', float:'right'}}><div id="tweet_container"></div></td>
							</tr></tbody>
						</table>
					</div>
            	</div>

				<div style={{display:'none'}}>
					<div id="booksz">
						<div id="pagination"></div>
						<br style={{clear:'both'}}/><hr />
						<div id="bookdivtitle"></div>
						<div id="bookdiv"></div>
					</div>
				</div>

				<div className="modal fade" id="books" tabIndex="-1" role="dialog">
				  <div className="modal-dialog">
					<div className="modal-content">
					  <div className="modal-header">
						<button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
						<h4 className="modal-title books-title">Find in Texts</h4>
					  </div>
					  <div className="modal-body">
						<nav>
							<ul className="pagination">
								<li><a href="#">«</a></li>
								<li><a href="#">1</a></li>
								<li><a href="#">»</a></li>
							</ul>
						</nav>

						<ul className="book-list"></ul>

					  </div>
					</div>
				  </div>
				</div>

				<span id="category_box_template" className="box category_box_template">
					<div className="btn-group" role="group" aria-label="category_box">
						<div className="dropdown">
							<span className="box_data">All Metadata</span>
							<a className="btn btn-default btn-sm" href="#" role="button" data-toggle="dropdown"  aria-haspopup="true" aria-expanded="false" id="toggle1" >
								<span className="glyphicon glyphicon-filter"  aria-hidden="true"></span>
								<span className="caret"></span>
							</a>
							<ul className="dropdown-menu facet-selection" aria-labelledby="toggle1">
								<li style={{padding:"3px 20px"}} className="text-right">Restrict search to the following texts</li>
								<li role="separator" className="divider"></li>
							</ul>

						</div>
					</div>
				</span>
            </div>
        );
    };
};

export default Bookworm;