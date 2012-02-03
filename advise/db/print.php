<?php
require_once('util.php');
require_once('lib/tcpdf_php4/config/lang/eng.php');
require_once('lib/tcpdf_php4/tcpdf.php'); 

if (!isset($_POST["data"])) {
	die("No schedule sent to print.");
}

function debug($str) {
	//echo($str);
}

$data = json_decode(stripslashes($_POST["data"]), false);
$credits = json_decode(stripslashes($_POST["credits"]), false);
//var_dump($credits);

// create new PDF document
$pdf = new TCPDF("L", "mm", PDF_PAGE_FORMAT, true, 'UTF-8', false);

$pdf->SetMargins(PDF_MARGIN_LEFT, PDF_MARGIN_TOP, PDF_MARGIN_RIGHT);
$pdf->AddPage();
$pdf->SetAutoPageBreak(false);
$pdf->SetFillColor(255, 255, 255);

//setup the margins

class Schedule {
	var $pdf;
	var $xdim;
	var $ydim;
	
	var $maxcredits;
	var $numsems;
	var $margins;
	var $credw;
	var $semheight;
	
	var $fontsize;
	
	/*
	@param pdf the pdf to draw on
	@param maxcredits the number of credits per semester (usually 24)
	@param numsems the number of semesters to show (usually 8)	
	*/
	function Schedule($pdf, $maxcredits, $numsems) {
		$margins = $pdf->getMargins();

		$this->startx = $margins["left"];
		$this->starty = $margins["top"];
		$pdf->setXY($this->startx, $this->starty);
		$this->xdim = $pdf->getPageWidth() - $margins["left"] - $margins["right"];
		$this->ydim = $pdf->getPageHeight() - $margins["top"] - $margins["bottom"] - 30;
		$this->pdf = $pdf;
		
		debug("page dims: [" . $this->xdim . "," . $this->ydim . "]");
		
		$this->maxcredits = $maxcredits;
		$this->numsems = $numsems;
		$this->credw = $this->xdim / $maxcredits;
		$this->semheight = $this->ydim / $numsems;
		
		$this->fontsize = 12;
		$this->fontname = 'helvetica';
		$this->pdf->SetFont($this->fontname, '', $this->fontsize);
	}
	
	/*
	Draw the background information and credit numbers	
	*/
	function drawBG() {
		//draw semester backgrounds
		//this appears to obscure what we actually want to draw
		for ($idx = 0; $idx < $this->numsems; ++$idx) {
			$col1 = ($idx % 2 == 0) ? array(225, 225, 255) : array(255, 255, 255);
			$col2 = array(255, 255, 255);
			/*
			$this->pdf->LinearGradient(
				$this->startx, $this->starty + $this->semheight * $x, //x, y
				$this->xdim, $this->semheight, //w, h
				$col1, $col2,
				array(0, 0, 0, 1) //top to bottom
			);*/
			$this->pdf->Rect(
				$this->startx, $this->starty + $this->semheight * $idx, //x, y
				$this->xdim, $this->semheight, //w, h
				"F",
				array(),
				$col1			
			);
		}
		
		//draw vertical lines at credit boundaries
		for ($idx = 1; $idx < $this->maxcredits; ++$idx) {
			$x = $this->startx + $this->credw * $idx;
			
			$ismajor = ($idx % 4 == 0);
			  
			$this->pdf->Line(
				$x, $this->starty - 2,
				$x, $this->starty + $this->ydim,
				array(
					"width" => $ismajor ? 0.4 : 0.2,
					"dash" => $ismajor ? "" : "2,2",
					"color" => array(100, 100, 100)
				)
			);
		}
		
		
		//draw credit numbers
		for ($idx = 0; $idx < $this->maxcredits; ++$idx) {
			$ismajor = ($idx % 4 == 0);
			$this->pdf->SetFont($this->fontname, $ismajor ? 'b' : '', 7);
			$x = $this->startx + $this->credw * $idx;
			$w = $this->credw;
			
			$this->pdf->setXY($x, $this->starty - 3.5);
			$this->pdf->Cell(
				$w, 0, //w, h
				($idx + 1) . "",
				0, //border
				0, //ln
				"C" //align
			);
		}
		$this->pdf->SetFont($this->fontname, '', $this->fontsize);
		
		//$this->pdf->Clip(0, 0, $this->xdim, $this->ydim);
	}
	
	/*
	Draw the header image and title	
	*/
	function drawHeader($username) {
		$this->pdf->Image(
			"../img/halplogo_small.png", //file
			$this->startx, $this->starty - 20, //x, y
			30, 0 //w, h
		);
		
		//"Schedule for <username>"
		$this->pdf->SetFontSize(20);
		$this->pdf->Text(
			$this->startx + 33, $this->starty - 12, //x, y
			$username . "'s Plan"
		);
		
		//date printed
		$this->pdf->SetFontSize(10);
		$this->pdf->Text(
			$this->startx + 33, $this->starty - 7, //x, y
			"Created " . date("F j, Y, g:i a")
		);		
		
		$this->pdf->SetFontSize($this->fontsize);
	}
	
	/*
	Draw the information about credits specified in credits	
	*/
	function drawCredits($credits) {
		$this->pdf->SetFontSize(11);
		$percol = 2;
		$colspacex = 50;
		$colspacey = 5;
		
		$col = 0;
		$coldx = 0;
		for ($idx = 0; $idx < count($credits); ++$idx) {
			$crarr = $credits[$idx];
			$x = $this->startx + 110 + $col * $colspacex;
			$y = $this->starty - ($percol * $colspacey) + $coldx * $colspacey - 4;
			
			$this->pdf->Text(
				$x, $y, $crarr[2]
			);
			
			++$coldx;
			if ($coldx > $percol - 1) {
				$coldx = 0;
				++$col;
			}	
		}
		$this->pdf->SetFontSize($this->fontsize);
	}
	
	/*
	Draw the specified course on the schedule	
	*/
	function drawCourse($course) {
		$color = $course->color;
		$x = $this->startx + $course->left * $this->credw;
		$y = $this->starty + $course->top * $this->semheight;
		$w = $course->width * $this->credw;
		$h = 1 * ($this->semheight - 0);
		
		$this->pdf->SetFillColor($color[0], $color[1], $color[2]);
		
		//add some padding
		$pad = 1;
		if ($course->ismeta) {
			$metah = 4;
			$this->pdf->setXY($x, $y-$metah);
			$this->pdf->Rect($x, $y-$metah+$pad, $w, $metah, "F", array(), $color);
			$this->pdf->MultiCell(
				$w, //width
				$metah, //height
				$course->text, //text
				0, //border
				'L', //align
				1, //fill
				0, //line (0:to right, 1:begin next, 2:below)
				0, //x
				0, //y
				true, //reset last cell height
				0, //stretch disabled
				true //is html
			);
			//outline
			$this->pdf->Rect($x, $y, $pad, $h, "F", array(), $color);
			$this->pdf->Rect($x+$w-$pad, $y, $pad, $h, "F", array(), $color);
			$this->pdf->Rect($x, $y+$h-$pad, $w, $pad, "F", array(), $color);
		} else {
			$x += $pad;
			$y += $pad;
			$w -= $pad*2;
			$h -= $pad*2;			

			$this->pdf->setXY($x, $y);
			$this->pdf->Rect($x, $y, $w, $h, "F", array(), $color);
			$this->pdf->MultiCell(
				$w, //width
				$h, //height
				$course->text, //text
				0, //border
				'L', //align
				1, //fill
				0, //line (0:to right, 1:begin next, 2:below)
				0, //x
				0, //y
				true, //reset last cell height
				0, //stretch disabled
				true //is html
			);
		}
	}
	
	/*
	Draw a footer with the specified text	
	*/
	function drawFooter($text) {
		$this->pdf->SetFontSize(10);
		
		$this->pdf->Text(
			$this->startx, $this->starty + $this->ydim + 9,
			$text
		);
		
		$this->pdf->SetFontSize($this->fontsize);
	}
}

$sched = new Schedule($pdf, 24, 8);

$uname = $_POST["username"];
if (strlen($uname) > 13) {
	$uname = substr($uname, 0, 10) . "...";
}
$sched->drawHeader($uname);
$sched->drawBG();

$sched->drawCredits($credits);

for ($x = 0; $x < count($data); ++$x) {
	$sem = $data[$x];
	for ($y = 0; $y < count($sem); ++$y) {
		$sched->drawCourse($sem[$y]);
	}
}

$sched->drawFooter("Go to http://www.advising.tk/ to send or feedback get involved!");

// print a line using Cell()
//$pdf->MultiCell(267, 0, "<b>Hola!</b><br><font size='13'>This is another line</font>", 0, 'L', 1, 1, 0, 0, true, 0, true);

//Close and output PDF document
//I is "inline" - sends to browser
//D forces a download
//F sends to a file
//S returns the document as a string

$outputname =  $uname . "." . date("m.d.Y") . ".pdf";
$linkname = "db/printed/" . $outputname;
$pdf->Output("printed/" . $outputname, 'F');
echo "Schedule printed to " . 
	"<a href='$linkname' target='_blank'>$outputname</a>";
?>