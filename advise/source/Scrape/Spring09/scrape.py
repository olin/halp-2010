from xml import *
import pprint

class DocHandler(sax.handler.ContentHandler):
	def __init__(self):
		self.tablenum = 0
		self.rownum = 0
		self.colnum = 0
		self.STARTTABLE = 2
		self.ENDTABLE = 5
		
		self.currow = [""]*10
		self.allrows = []
	
	def startElement(self, name, attributes):
		if name.lower() == "table":
			self.tablenum += 1
			self.rownum = 0
		if self.tablenum >= self.STARTTABLE and name.lower() == "tr":
			self.rownum += 1
			self.colnum = 0
		if name.lower() == "td":
			self.colnum += 1
			if self.colnum == 10:
				if self.tablenum >= self.STARTTABLE and self.tablenum <= self.ENDTABLE and self.rownum >= 2:
					self.allrows.append(self.currow)
				self.currow = [""]*10
			self.intd = True
	
	def characters(self, data):
		#find the second table in the document...
		if self.tablenum >= self.STARTTABLE and self.tablenum <= self.ENDTABLE:
			if self.rownum >= 2:
				if self.intd:
					#try:
					#	print self.tablenum, self.colnum, data
					#except:
					#	print "err."
					self.currow[self.colnum-1] = data.strip()
					#print self.rownum, self.colnum, data
	
	def endElement(self, name):
		if name.lower() == "td":
			self.intd = False
		
	def skippedEntity(self, name):
		pass

class SQLWrite:
	def __init__(self, semname):
		self.nl = "\n"
		self.semname = semname
		
	def writeout(self, table):
		strall = self.header() + self.nl
		for row in table:
			curr = [self.semname] + row
			strall += "(" + self.line(curr) + ")," + self.nl
			
		strall = strall[:-2] + ";"
		return strall
	
	def header(self):
		return "INSERT INTO `Offerings` (`Semester`, `Area`, `Code`, `Section`, `Title`, `Instructors`, `Credits`, `Time`, `Location`, `EnrollLimit`, `Note`) VALUES"

	def line(self, arr):
		return ",".join(["'%s'" % (s) for s in arr])

if __name__ == '__main__':
	parser = sax.make_parser()
	handler = DocHandler()
	parser.setContentHandler(handler)
	parser.parse("RegistrationBooklet_Spring_2009.xml")
	
	wr = SQLWrite("17")
	print wr.writeout(handler.allrows)