'''
Moderately kludge-tastic scraping of course catalog
'''

nl = "\n"

#test if a line represents a course title
def iscourse(line):
	splt = line.strip().split(" ")
	#if there's a "formerly", only consider the first bit
	if line.find("formerly") > 0:
		splt = splt[0:2]
		
	#find if this is a course
	if (splt[0] == splt[0].upper()) and len(splt) == 2:
		try:
			n = int(splt[1])
			if (n > 99) and (n < 9999):
				return " ".join(splt)
		except ValueError:
			#allow a single char A on the end
			if splt[1].endswith("A"):
				return " ".join(splt)
	return False

#convert a string representing course data into a course
def convcourse(name, str):
	#make sure the instructor title isn't on the same line
	fidx = str.index(nl)
	title = str[0:fidx-1]
	rest = str[fidx+1:]
	
	iidx = title.find("Instructor")
	if iidx > 0:
		rest = title[iidx-1:] + rest
		title = title[:iidx-1]
	
	#remove the instructor
	rest = rest[15:]
	idx = rest.index("Credits:")
	instructor = rest[:idx-1]
	rest = rest[idx+9:]
	
	#get the credits
	idx = rest.index("Hours:")
	credits = rest[:idx-1]
	rest = rest[idx+7:]
	
	#find the next space; multiple possibilities ensue.
	idx = rest.index(" ")
	hours = rest[:idx]
	rest = rest[idx+1:]
	
	#find prerequisites and corequisites
	prereq = ""
	coreq = ""
	next = "usually offered:"
	if rest.startswith("Prerequisite"):
		if rest.find("Co-requisite") > 0:
			idx = rest.index("Co-requisites:")
			prereq = rest[14:idx-1].strip()
			rest = rest[idx:]
		else:
			idx = rest.lower().index(next)
			prereq = rest[14:idx-1].strip()
			rest = rest[idx+17:]
	if rest.startswith("Co-requisite"):
		idx = rest.lower().index(next)
		coreq = rest[14:idx-1].strip()
		rest = rest[idx+17:]
	if rest.startswith("Pre/Co-requisite"):
		idx = rest.lower().index(next)
		coreq = rest[18:idx-1].strip()
		rest = rest[idx+17:]
		
	#grab the usually offered
	if rest.lower().find(next) > -1:
		rest = rest[rest.lower().find(next)+17:]
	
	#this is potentially dangerous.
	idx = rest.index(nl)
	offered = rest[:idx-1]
	rest = rest[idx+1:]
	rest = rest.replace(nl,"")
	
	return "('" + "','".join(
		[name, title, instructor, credits, hours, coreq, prereq, offered, rest]
	) + "')"

if __name__ == '__main__':
	fil = open("course_catalog_07_08.txt","r")
	out = open("out.txt","w")
	
	header = '''INSERT INTO `courses` (`Code`, `Title`, `Instructors`, `Credits`, `Hours`, `Corequisites`, `Prerequisites`, `Offered`, `Description`) VALUES \n'''
	out.write(header)
	
	initial = True
	thecourse = ""
	coursecont = ""
	allcourses = dict()
	
	#find the course listings
	for line in fil:
		if initial:
			if line.startswith("Course Listings Summary"):
				initial = False
			continue
		course = iscourse(line)
		if course:
			#don't write the first course
			if thecourse != "" and (not thecourse in allcourses):
				out.write(convcourse(thecourse, coursecont) + "," + nl)
				allcourses[thecourse] = True
			thecourse = course.strip()
			coursecont = ""
		else:
			#quit
			if line.startswith("Academic Policies") and (not thecourse in allcourses):
				out.write(convcourse(thecourse, coursecont))
				break
			if 	(not line.startswith("|")) and \
				(not line.startswith("\xa6")) and \
				(not line.strip() == ""):
				coursecont += line
	
	out.write(";")
	
	fil.close()
	out.close()