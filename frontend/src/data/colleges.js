/**
 * Curated list of major Indian colleges & universities.
 * Format: [name, shortName, city, state, officialDomain, type]
 *
 * The official domain is used to fetch the institution's logo/emblem at runtime.
 * If a logo cannot be loaded, a styled monogram crest is shown instead.
 * Users can also enter any college that is not listed (see CollegeSelectorModal).
 */
const RAW = [
  // ---------- IITs ----------
  ['Indian Institute of Technology Bombay', 'IIT Bombay', 'Mumbai', 'Maharashtra', 'iitb.ac.in', 'IIT'],
  ['Indian Institute of Technology Delhi', 'IIT Delhi', 'New Delhi', 'Delhi', 'iitd.ac.in', 'IIT'],
  ['Indian Institute of Technology Madras', 'IIT Madras', 'Chennai', 'Tamil Nadu', 'iitm.ac.in', 'IIT'],
  ['Indian Institute of Technology Kanpur', 'IIT Kanpur', 'Kanpur', 'Uttar Pradesh', 'iitk.ac.in', 'IIT'],
  ['Indian Institute of Technology Kharagpur', 'IIT Kharagpur', 'Kharagpur', 'West Bengal', 'iitkgp.ac.in', 'IIT'],
  ['Indian Institute of Technology Roorkee', 'IIT Roorkee', 'Roorkee', 'Uttarakhand', 'iitr.ac.in', 'IIT'],
  ['Indian Institute of Technology Guwahati', 'IIT Guwahati', 'Guwahati', 'Assam', 'iitg.ac.in', 'IIT'],
  ['Indian Institute of Technology Hyderabad', 'IIT Hyderabad', 'Sangareddy', 'Telangana', 'iith.ac.in', 'IIT'],
  ['Indian Institute of Technology (BHU) Varanasi', 'IIT BHU', 'Varanasi', 'Uttar Pradesh', 'iitbhu.ac.in', 'IIT'],
  ['Indian Institute of Technology (ISM) Dhanbad', 'IIT ISM Dhanbad', 'Dhanbad', 'Jharkhand', 'iitism.ac.in', 'IIT'],
  ['Indian Institute of Technology Indore', 'IIT Indore', 'Indore', 'Madhya Pradesh', 'iiti.ac.in', 'IIT'],
  ['Indian Institute of Technology Patna', 'IIT Patna', 'Patna', 'Bihar', 'iitp.ac.in', 'IIT'],
  ['Indian Institute of Technology Bhubaneswar', 'IIT Bhubaneswar', 'Bhubaneswar', 'Odisha', 'iitbbs.ac.in', 'IIT'],
  ['Indian Institute of Technology Gandhinagar', 'IIT Gandhinagar', 'Gandhinagar', 'Gujarat', 'iitgn.ac.in', 'IIT'],
  ['Indian Institute of Technology Jodhpur', 'IIT Jodhpur', 'Jodhpur', 'Rajasthan', 'iitj.ac.in', 'IIT'],
  ['Indian Institute of Technology Ropar', 'IIT Ropar', 'Rupnagar', 'Punjab', 'iitrpr.ac.in', 'IIT'],
  ['Indian Institute of Technology Mandi', 'IIT Mandi', 'Mandi', 'Himachal Pradesh', 'iitmandi.ac.in', 'IIT'],
  ['Indian Institute of Technology Tirupati', 'IIT Tirupati', 'Tirupati', 'Andhra Pradesh', 'iittp.ac.in', 'IIT'],
  ['Indian Institute of Technology Palakkad', 'IIT Palakkad', 'Palakkad', 'Kerala', 'iitpkd.ac.in', 'IIT'],
  ['Indian Institute of Technology Goa', 'IIT Goa', 'Ponda', 'Goa', 'iitgoa.ac.in', 'IIT'],
  ['Indian Institute of Technology Jammu', 'IIT Jammu', 'Jammu', 'Jammu and Kashmir', 'iitjammu.ac.in', 'IIT'],
  ['Indian Institute of Technology Dharwad', 'IIT Dharwad', 'Dharwad', 'Karnataka', 'iitdh.ac.in', 'IIT'],
  ['Indian Institute of Technology Bhilai', 'IIT Bhilai', 'Bhilai', 'Chhattisgarh', 'iitbhilai.ac.in', 'IIT'],

  // ---------- NITs ----------
  ['National Institute of Technology Tiruchirappalli', 'NIT Trichy', 'Tiruchirappalli', 'Tamil Nadu', 'nitt.edu', 'NIT'],
  ['National Institute of Technology Karnataka', 'NITK Surathkal', 'Surathkal', 'Karnataka', 'nitk.ac.in', 'NIT'],
  ['National Institute of Technology Warangal', 'NIT Warangal', 'Warangal', 'Telangana', 'nitw.ac.in', 'NIT'],
  ['National Institute of Technology Calicut', 'NIT Calicut', 'Kozhikode', 'Kerala', 'nitc.ac.in', 'NIT'],
  ['National Institute of Technology Rourkela', 'NIT Rourkela', 'Rourkela', 'Odisha', 'nitrkl.ac.in', 'NIT'],
  ['Motilal Nehru National Institute of Technology', 'MNNIT Allahabad', 'Prayagraj', 'Uttar Pradesh', 'mnnit.ac.in', 'NIT'],
  ['Visvesvaraya National Institute of Technology', 'VNIT Nagpur', 'Nagpur', 'Maharashtra', 'vnit.ac.in', 'NIT'],
  ['Sardar Vallabhbhai National Institute of Technology', 'SVNIT Surat', 'Surat', 'Gujarat', 'svnit.ac.in', 'NIT'],
  ['Malaviya National Institute of Technology', 'MNIT Jaipur', 'Jaipur', 'Rajasthan', 'mnit.ac.in', 'NIT'],
  ['Maulana Azad National Institute of Technology', 'MANIT Bhopal', 'Bhopal', 'Madhya Pradesh', 'manit.ac.in', 'NIT'],
  ['National Institute of Technology Durgapur', 'NIT Durgapur', 'Durgapur', 'West Bengal', 'nitdgp.ac.in', 'NIT'],
  ['Dr. B R Ambedkar National Institute of Technology', 'NIT Jalandhar', 'Jalandhar', 'Punjab', 'nitj.ac.in', 'NIT'],
  ['National Institute of Technology Kurukshetra', 'NIT Kurukshetra', 'Kurukshetra', 'Haryana', 'nitkkr.ac.in', 'NIT'],
  ['National Institute of Technology Patna', 'NIT Patna', 'Patna', 'Bihar', 'nitp.ac.in', 'NIT'],
  ['National Institute of Technology Srinagar', 'NIT Srinagar', 'Srinagar', 'Jammu and Kashmir', 'nitsri.ac.in', 'NIT'],
  ['National Institute of Technology Silchar', 'NIT Silchar', 'Silchar', 'Assam', 'nits.ac.in', 'NIT'],
  ['National Institute of Technology Jamshedpur', 'NIT Jamshedpur', 'Jamshedpur', 'Jharkhand', 'nitjsr.ac.in', 'NIT'],
  ['National Institute of Technology Raipur', 'NIT Raipur', 'Raipur', 'Chhattisgarh', 'nitrr.ac.in', 'NIT'],
  ['National Institute of Technology Hamirpur', 'NIT Hamirpur', 'Hamirpur', 'Himachal Pradesh', 'nith.ac.in', 'NIT'],
  ['National Institute of Technology Andhra Pradesh', 'NIT Andhra Pradesh', 'Tadepalligudem', 'Andhra Pradesh', 'nitandhra.ac.in', 'NIT'],
  ['National Institute of Technology Delhi', 'NIT Delhi', 'New Delhi', 'Delhi', 'nitdelhi.ac.in', 'NIT'],
  ['National Institute of Technology Goa', 'NIT Goa', 'Ponda', 'Goa', 'nitgoa.ac.in', 'NIT'],
  ['National Institute of Technology Puducherry', 'NIT Puducherry', 'Karaikal', 'Puducherry', 'nitpy.ac.in', 'NIT'],
  ['National Institute of Technology Uttarakhand', 'NIT Uttarakhand', 'Srinagar (Garhwal)', 'Uttarakhand', 'nituk.ac.in', 'NIT'],

  // ---------- IIITs ----------
  ['International Institute of Information Technology Hyderabad', 'IIIT Hyderabad', 'Hyderabad', 'Telangana', 'iiit.ac.in', 'IIIT'],
  ['Indraprastha Institute of Information Technology Delhi', 'IIIT Delhi', 'New Delhi', 'Delhi', 'iiitd.ac.in', 'IIIT'],
  ['International Institute of Information Technology Bangalore', 'IIIT Bangalore', 'Bengaluru', 'Karnataka', 'iiitb.ac.in', 'IIIT'],
  ['Indian Institute of Information Technology Allahabad', 'IIIT Allahabad', 'Prayagraj', 'Uttar Pradesh', 'iiita.ac.in', 'IIIT'],
  ['ABV-Indian Institute of Information Technology and Management Gwalior', 'IIITM Gwalior', 'Gwalior', 'Madhya Pradesh', 'iiitm.ac.in', 'IIIT'],
  ['PDPM Indian Institute of Information Technology, Design and Manufacturing Jabalpur', 'IIITDM Jabalpur', 'Jabalpur', 'Madhya Pradesh', 'iiitdmj.ac.in', 'IIIT'],
  ['Indian Institute of Information Technology, Design and Manufacturing Kancheepuram', 'IIITDM Kancheepuram', 'Chennai', 'Tamil Nadu', 'iiitdm.ac.in', 'IIIT'],
  ['Indian Institute of Information Technology Sri City', 'IIIT Sri City', 'Sri City', 'Andhra Pradesh', 'iiits.ac.in', 'IIIT'],

  // ---------- IISc / IISERs / Research ----------
  ['Indian Institute of Science', 'IISc Bangalore', 'Bengaluru', 'Karnataka', 'iisc.ac.in', 'Institute'],
  ['Indian Institute of Science Education and Research Pune', 'IISER Pune', 'Pune', 'Maharashtra', 'iiserpune.ac.in', 'Institute'],
  ['Indian Institute of Science Education and Research Kolkata', 'IISER Kolkata', 'Mohanpur', 'West Bengal', 'iiserkol.ac.in', 'Institute'],
  ['Indian Institute of Science Education and Research Mohali', 'IISER Mohali', 'Mohali', 'Punjab', 'iisermohali.ac.in', 'Institute'],
  ['Indian Institute of Science Education and Research Bhopal', 'IISER Bhopal', 'Bhopal', 'Madhya Pradesh', 'iiserb.ac.in', 'Institute'],
  ['Indian Institute of Science Education and Research Thiruvananthapuram', 'IISER TVM', 'Thiruvananthapuram', 'Kerala', 'iisertvm.ac.in', 'Institute'],
  ['Indian Statistical Institute', 'ISI Kolkata', 'Kolkata', 'West Bengal', 'isical.ac.in', 'Institute'],
  ['Birla Institute of Technology and Science, Pilani', 'BITS Pilani', 'Pilani', 'Rajasthan', 'bits-pilani.ac.in', 'Deemed University'],
  ['Birla Institute of Technology, Mesra', 'BIT Mesra', 'Ranchi', 'Jharkhand', 'bitmesra.ac.in', 'Deemed University'],

  // ---------- IIMs & Management ----------
  ['Indian Institute of Management Ahmedabad', 'IIM Ahmedabad', 'Ahmedabad', 'Gujarat', 'iima.ac.in', 'IIM'],
  ['Indian Institute of Management Bangalore', 'IIM Bangalore', 'Bengaluru', 'Karnataka', 'iimb.ac.in', 'IIM'],
  ['Indian Institute of Management Calcutta', 'IIM Calcutta', 'Kolkata', 'West Bengal', 'iimcal.ac.in', 'IIM'],
  ['Indian Institute of Management Lucknow', 'IIM Lucknow', 'Lucknow', 'Uttar Pradesh', 'iiml.ac.in', 'IIM'],
  ['Indian Institute of Management Kozhikode', 'IIM Kozhikode', 'Kozhikode', 'Kerala', 'iimk.ac.in', 'IIM'],
  ['Indian Institute of Management Indore', 'IIM Indore', 'Indore', 'Madhya Pradesh', 'iimidr.ac.in', 'IIM'],
  ['XLRI - Xavier School of Management', 'XLRI', 'Jamshedpur', 'Jharkhand', 'xlri.ac.in', 'Management'],
  ['Narsee Monjee Institute of Management Studies', 'NMIMS', 'Mumbai', 'Maharashtra', 'nmims.edu', 'Deemed University'],

  // ---------- Medical / Law / Design ----------
  ['All India Institute of Medical Sciences, New Delhi', 'AIIMS Delhi', 'New Delhi', 'Delhi', 'aiims.edu', 'Medical'],
  ['Christian Medical College, Vellore', 'CMC Vellore', 'Vellore', 'Tamil Nadu', 'cmch-vellore.edu', 'Medical'],
  ['Jawaharlal Institute of Postgraduate Medical Education and Research', 'JIPMER', 'Puducherry', 'Puducherry', 'jipmer.edu.in', 'Medical'],
  ['National Law School of India University', 'NLSIU Bangalore', 'Bengaluru', 'Karnataka', 'nls.ac.in', 'Law'],
  ['NALSAR University of Law', 'NALSAR', 'Hyderabad', 'Telangana', 'nalsar.ac.in', 'Law'],
  ['National Law University Delhi', 'NLU Delhi', 'New Delhi', 'Delhi', 'nludelhi.ac.in', 'Law'],
  ['National Institute of Design', 'NID Ahmedabad', 'Ahmedabad', 'Gujarat', 'nid.edu', 'Design'],
  ['National Institute of Fashion Technology', 'NIFT', 'New Delhi', 'Delhi', 'nift.ac.in', 'Design'],

  // ---------- Central & State Universities ----------
  ['University of Delhi', 'Delhi University', 'New Delhi', 'Delhi', 'du.ac.in', 'Central University'],
  ['Jawaharlal Nehru University', 'JNU', 'New Delhi', 'Delhi', 'jnu.ac.in', 'Central University'],
  ['Jamia Millia Islamia', 'Jamia Millia Islamia', 'New Delhi', 'Delhi', 'jmi.ac.in', 'Central University'],
  ['Jamia Hamdard', 'Jamia Hamdard', 'New Delhi', 'Delhi', 'jamiahamdard.edu', 'Deemed University'],
  ['Guru Gobind Singh Indraprastha University', 'GGSIPU', 'New Delhi', 'Delhi', 'ipu.ac.in', 'State University'],
  ['Delhi Technological University', 'DTU', 'New Delhi', 'Delhi', 'dtu.ac.in', 'State University'],
  ['Netaji Subhas University of Technology', 'NSUT', 'New Delhi', 'Delhi', 'nsut.ac.in', 'State University'],
  ['Indira Gandhi Delhi Technical University for Women', 'IGDTUW', 'New Delhi', 'Delhi', 'igdtuw.ac.in', 'State University'],
  ["St. Stephen's College", "St. Stephen's", 'New Delhi', 'Delhi', 'ststephens.edu', 'College'],
  ['Shri Ram College of Commerce', 'SRCC', 'New Delhi', 'Delhi', 'srcc.edu', 'College'],
  ['Hindu College', 'Hindu College', 'New Delhi', 'Delhi', 'hinducollege.ac.in', 'College'],
  ['Lady Shri Ram College for Women', 'LSR', 'New Delhi', 'Delhi', 'lsr.edu.in', 'College'],
  ['Miranda House', 'Miranda House', 'New Delhi', 'Delhi', 'mirandahouse.ac.in', 'College'],
  ['Banaras Hindu University', 'BHU', 'Varanasi', 'Uttar Pradesh', 'bhu.ac.in', 'Central University'],
  ['Aligarh Muslim University', 'AMU', 'Aligarh', 'Uttar Pradesh', 'amu.ac.in', 'Central University'],
  ['University of Allahabad', 'Allahabad University', 'Prayagraj', 'Uttar Pradesh', 'allduniv.ac.in', 'Central University'],
  ['University of Lucknow', 'Lucknow University', 'Lucknow', 'Uttar Pradesh', 'lkouniv.ac.in', 'State University'],
  ['Dr. A.P.J. Abdul Kalam Technical University', 'AKTU', 'Lucknow', 'Uttar Pradesh', 'aktu.ac.in', 'State University'],
  ['Harcourt Butler Technical University', 'HBTU', 'Kanpur', 'Uttar Pradesh', 'hbtu.ac.in', 'State University'],
  ['Madan Mohan Malaviya University of Technology', 'MMMUT', 'Gorakhpur', 'Uttar Pradesh', 'mmmut.ac.in', 'State University'],
  ['Amity University', 'Amity University', 'Noida', 'Uttar Pradesh', 'amity.edu', 'Private University'],
  ['Sharda University', 'Sharda University', 'Greater Noida', 'Uttar Pradesh', 'sharda.ac.in', 'Private University'],
  ['Galgotias University', 'Galgotias University', 'Greater Noida', 'Uttar Pradesh', 'galgotiasuniversity.edu.in', 'Private University'],
  ['Bennett University', 'Bennett University', 'Greater Noida', 'Uttar Pradesh', 'bennett.edu.in', 'Private University'],
  ['Jaypee Institute of Information Technology', 'JIIT Noida', 'Noida', 'Uttar Pradesh', 'jiit.ac.in', 'Deemed University'],
  ['Shiv Nadar University', 'Shiv Nadar University', 'Greater Noida', 'Uttar Pradesh', 'snu.edu.in', 'Private University'],

  // ---------- Maharashtra ----------
  ['University of Mumbai', 'Mumbai University', 'Mumbai', 'Maharashtra', 'mu.ac.in', 'State University'],
  ['Savitribai Phule Pune University', 'SPPU', 'Pune', 'Maharashtra', 'unipune.ac.in', 'State University'],
  ['Rashtrasant Tukadoji Maharaj Nagpur University', 'Nagpur University', 'Nagpur', 'Maharashtra', 'nagpuruniversity.ac.in', 'State University'],
  ['COEP Technological University', 'COEP Pune', 'Pune', 'Maharashtra', 'coep.org.in', 'State University'],
  ['Veermata Jijabai Technological Institute', 'VJTI Mumbai', 'Mumbai', 'Maharashtra', 'vjti.ac.in', 'College'],
  ['Institute of Chemical Technology', 'ICT Mumbai', 'Mumbai', 'Maharashtra', 'ictmumbai.edu.in', 'Deemed University'],
  ['Sardar Patel Institute of Technology', 'SPIT Mumbai', 'Mumbai', 'Maharashtra', 'spit.ac.in', 'College'],
  ['K. J. Somaiya College of Engineering', 'KJSCE', 'Mumbai', 'Maharashtra', 'somaiya.edu', 'College'],
  ["St. Xavier's College, Mumbai", "St. Xavier's Mumbai", 'Mumbai', 'Maharashtra', 'xaviers.edu', 'College'],
  ['Pune Institute of Computer Technology', 'PICT Pune', 'Pune', 'Maharashtra', 'pict.edu', 'College'],
  ['Vishwakarma Institute of Technology', 'VIT Pune', 'Pune', 'Maharashtra', 'vit.edu', 'College'],
  ['MIT World Peace University', 'MIT-WPU', 'Pune', 'Maharashtra', 'mitwpu.edu.in', 'Private University'],
  ['Symbiosis International University', 'Symbiosis', 'Pune', 'Maharashtra', 'siu.edu.in', 'Deemed University'],
  ['Fergusson College', 'Fergusson College', 'Pune', 'Maharashtra', 'fergusson.edu', 'College'],
  ['Walchand College of Engineering', 'WCE Sangli', 'Sangli', 'Maharashtra', 'walchandsangli.ac.in', 'College'],

  // ---------- Karnataka ----------
  ['Visvesvaraya Technological University', 'VTU', 'Belagavi', 'Karnataka', 'vtu.ac.in', 'State University'],
  ['Bangalore University', 'Bangalore University', 'Bengaluru', 'Karnataka', 'bangaloreuniversity.ac.in', 'State University'],
  ['University of Mysore', 'Mysore University', 'Mysuru', 'Karnataka', 'uni-mysore.ac.in', 'State University'],
  ['Karnatak University', 'Karnatak University', 'Dharwad', 'Karnataka', 'kud.ac.in', 'State University'],
  ['Manipal Academy of Higher Education', 'MAHE Manipal', 'Manipal', 'Karnataka', 'manipal.edu', 'Deemed University'],
  ['R. V. College of Engineering', 'RVCE', 'Bengaluru', 'Karnataka', 'rvce.edu.in', 'College'],
  ['B.M.S. College of Engineering', 'BMSCE', 'Bengaluru', 'Karnataka', 'bmsce.ac.in', 'College'],
  ['M. S. Ramaiah Institute of Technology', 'MSRIT', 'Bengaluru', 'Karnataka', 'msrit.edu', 'College'],
  ['PES University', 'PES University', 'Bengaluru', 'Karnataka', 'pes.edu', 'Private University'],
  ['Nitte Meenakshi Institute of Technology', 'NMIT', 'Bengaluru', 'Karnataka', 'nmit.ac.in', 'College'],
  ['Nitte (Deemed to be University)', 'Nitte University', 'Mangaluru', 'Karnataka', 'nitte.edu.in', 'Deemed University'],
  ['Christ University', 'Christ University', 'Bengaluru', 'Karnataka', 'christuniversity.in', 'Deemed University'],

  // ---------- Tamil Nadu ----------
  ['Anna University', 'Anna University', 'Chennai', 'Tamil Nadu', 'annauniv.edu', 'State University'],
  ['Vellore Institute of Technology', 'VIT Vellore', 'Vellore', 'Tamil Nadu', 'vit.ac.in', 'Deemed University'],
  ['SRM Institute of Science and Technology', 'SRM IST', 'Chennai', 'Tamil Nadu', 'srmist.edu.in', 'Deemed University'],
  ['Amrita Vishwa Vidyapeetham', 'Amrita University', 'Coimbatore', 'Tamil Nadu', 'amrita.edu', 'Deemed University'],
  ['SASTRA Deemed University', 'SASTRA', 'Thanjavur', 'Tamil Nadu', 'sastra.edu', 'Deemed University'],
  ['Sathyabama Institute of Science and Technology', 'Sathyabama', 'Chennai', 'Tamil Nadu', 'sathyabama.ac.in', 'Deemed University'],
  ['Karunya Institute of Technology and Sciences', 'Karunya', 'Coimbatore', 'Tamil Nadu', 'karunya.edu', 'Deemed University'],
  ['PSG College of Technology', 'PSG Tech', 'Coimbatore', 'Tamil Nadu', 'psgtech.edu', 'College'],
  ['Coimbatore Institute of Technology', 'CIT Coimbatore', 'Coimbatore', 'Tamil Nadu', 'cit.edu.in', 'College'],
  ['Kumaraguru College of Technology', 'KCT', 'Coimbatore', 'Tamil Nadu', 'kct.ac.in', 'College'],
  ['Thiagarajar College of Engineering', 'TCE Madurai', 'Madurai', 'Tamil Nadu', 'tce.edu', 'College'],
  ['Sri Sivasubramaniya Nadar College of Engineering', 'SSN', 'Chennai', 'Tamil Nadu', 'ssn.edu.in', 'College'],
  ['Loyola College, Chennai', 'Loyola College', 'Chennai', 'Tamil Nadu', 'loyolacollege.edu', 'College'],
  ['Madras Christian College', 'MCC', 'Chennai', 'Tamil Nadu', 'mcc.edu.in', 'College'],

  // ---------- Telangana ----------
  ['University of Hyderabad', 'UoH', 'Hyderabad', 'Telangana', 'uohyd.ac.in', 'Central University'],
  ['Osmania University', 'Osmania University', 'Hyderabad', 'Telangana', 'osmania.ac.in', 'State University'],
  ['Jawaharlal Nehru Technological University Hyderabad', 'JNTU Hyderabad', 'Hyderabad', 'Telangana', 'jntuh.ac.in', 'State University'],
  ['Kakatiya University', 'Kakatiya University', 'Warangal', 'Telangana', 'kakatiya.ac.in', 'State University'],
  ['Chaitanya Bharathi Institute of Technology', 'CBIT', 'Hyderabad', 'Telangana', 'cbit.ac.in', 'College'],
  ['VNR Vignana Jyothi Institute of Engineering and Technology', 'VNR VJIET', 'Hyderabad', 'Telangana', 'vnrvjiet.ac.in', 'College'],
  ['Gokaraju Rangaraju Institute of Engineering and Technology', 'GRIET', 'Hyderabad', 'Telangana', 'griet.ac.in', 'College'],
  ['B V Raju Institute of Technology', 'BVRIT', 'Narsapur', 'Telangana', 'bvrit.ac.in', 'College'],
  ['Vardhaman College of Engineering', 'Vardhaman', 'Hyderabad', 'Telangana', 'vardhaman.org', 'College'],
  ['Mahindra University', 'Mahindra University', 'Hyderabad', 'Telangana', 'mahindrauniversity.edu.in', 'Private University'],

  // KL University – Hyderabad campuses
  ['Koneru Lakshmaiah Education Foundation (KL University) – Hyderabad Campus, Aziz Nagar', 'KL University Aziz Nagar', 'Aziz Nagar, Hyderabad', 'Telangana', 'kluniversity.in', 'Deemed University'],
  ['Koneru Lakshmaiah Education Foundation (KL University) – Hyderabad Campus, Bachupally', 'KL University Bachupally', 'Bachupally, Hyderabad', 'Telangana', 'kluniversity.in', 'Deemed University'],

  // More Telangana colleges
  ['JNTUH University College of Engineering, Science and Technology Hyderabad', 'JNTUH UCESTH', 'Kukatpally, Hyderabad', 'Telangana', 'jntuhceh.ac.in', 'College'],
  ['BITS Pilani – Hyderabad Campus', 'BITS Hyderabad', 'Jawahar Nagar, Hyderabad', 'Telangana', 'bits-pilani.ac.in', 'Deemed University'],
  ['GITAM (Deemed to be University) – Hyderabad Campus', 'GITAM Hyderabad', 'Rudraram, Hyderabad', 'Telangana', 'gitam.edu', 'Deemed University'],
  ['Indian School of Business', 'ISB Hyderabad', 'Gachibowli, Hyderabad', 'Telangana', 'isb.edu', 'Management'],
  ['ICFAI Foundation for Higher Education', 'IFHE Hyderabad', 'Shankarpally, Hyderabad', 'Telangana', 'ifheindia.org', 'Deemed University'],
  ['Woxsen University', 'Woxsen University', 'Sangareddy', 'Telangana', 'woxsen.edu.in', 'Private University'],
  ['Anurag University', 'Anurag University', 'Ghatkesar, Hyderabad', 'Telangana', 'anurag.edu.in', 'Private University'],
  ['Malla Reddy University', 'Malla Reddy University', 'Maisammaguda, Hyderabad', 'Telangana', 'mallareddyuniversity.ac.in', 'Private University'],
  ['SR University', 'SR University', 'Warangal', 'Telangana', 'sru.edu.in', 'Private University'],
  ['Rajiv Gandhi University of Knowledge Technologies, Basar', 'RGUKT Basar', 'Basar', 'Telangana', 'rgukt.ac.in', 'State University'],
  ['CVR College of Engineering', 'CVR', 'Ibrahimpatnam, Hyderabad', 'Telangana', 'cvr.ac.in', 'College'],
  ['Vasavi College of Engineering', 'Vasavi', 'Ibrahimbagh, Hyderabad', 'Telangana', 'vce.ac.in', 'College'],
  ['Mahatma Gandhi Institute of Technology', 'MGIT', 'Gandipet, Hyderabad', 'Telangana', 'mgit.ac.in', 'College'],
  ['Maturi Venkata Subba Rao Engineering College', 'MVSR', 'Nadergul, Hyderabad', 'Telangana', 'mvsrec.edu.in', 'College'],
  ['Muffakham Jah College of Engineering and Technology', 'MJCET', 'Banjara Hills, Hyderabad', 'Telangana', 'mjcollege.ac.in', 'College'],
  ['Matrusri Engineering College', 'Matrusri', 'Saidabad, Hyderabad', 'Telangana', 'matrusri.edu.in', 'College'],
  ['Stanley College of Engineering and Technology for Women', 'Stanley', 'Abids, Hyderabad', 'Telangana', 'stanley.edu.in', 'College'],
  ['Sreenidhi Institute of Science and Technology', 'SNIST', 'Ghatkesar, Hyderabad', 'Telangana', 'sreenidhi.edu.in', 'College'],
  ['G. Narayanamma Institute of Technology and Science', 'GNITS', 'Shaikpet, Hyderabad', 'Telangana', 'gnits.ac.in', 'College'],
  ['BVRIT Hyderabad College of Engineering for Women', 'BVRIT Hyderabad', 'Bachupally, Hyderabad', 'Telangana', 'bvrithyderabad.edu.in', 'College'],
  ['Keshav Memorial Institute of Technology', 'KMIT', 'Narayanguda, Hyderabad', 'Telangana', 'kmit.in', 'College'],
  ['Neil Gogte Institute of Technology', 'NGIT', 'Uppal, Hyderabad', 'Telangana', 'ngit.ac.in', 'College'],
  ['Institute of Aeronautical Engineering', 'IARE', 'Dundigal, Hyderabad', 'Telangana', 'iare.ac.in', 'College'],
  ['Malla Reddy Engineering College', 'MREC', 'Maisammaguda, Hyderabad', 'Telangana', 'mrec.ac.in', 'College'],
  ['Malla Reddy College of Engineering and Technology', 'MRCET', 'Maisammaguda, Hyderabad', 'Telangana', 'mrcet.ac.in', 'College'],
  ['CMR Institute of Technology', 'CMRIT Hyderabad', 'Medchal, Hyderabad', 'Telangana', 'cmritonline.ac.in', 'College'],
  ['CMR College of Engineering and Technology', 'CMRCET', 'Medchal, Hyderabad', 'Telangana', 'cmrcet.ac.in', 'College'],
  ['MLR Institute of Technology', 'MLRIT', 'Dundigal, Hyderabad', 'Telangana', 'mlrinstitutions.ac.in', 'College'],
  ['Marri Laxman Reddy Institute of Technology and Management', 'MLRITM', 'Dundigal, Hyderabad', 'Telangana', 'mlrit.ac.in', 'College'],
  ['Geethanjali College of Engineering and Technology', 'GCET', 'Cheeryal, Hyderabad', 'Telangana', 'gcet.edu.in', 'College'],
  ["St. Martin's Engineering College", 'SMEC', 'Dhulapally, Hyderabad', 'Telangana', 'smec.ac.in', 'College'],
  ['Vignana Bharathi Institute of Technology', 'VBIT', 'Ghatkesar, Hyderabad', 'Telangana', 'vbithyd.ac.in', 'College'],
  ['Vidya Jyothi Institute of Technology', 'VJIT', 'Aziz Nagar, Hyderabad', 'Telangana', 'vjit.ac.in', 'College'],
  ['Methodist College of Engineering and Technology', 'Methodist', 'Abids, Hyderabad', 'Telangana', 'methodist.edu.in', 'College'],
  ['ACE Engineering College', 'ACE', 'Ghatkesar, Hyderabad', 'Telangana', 'aceec.ac.in', 'College'],
  ['Hyderabad Institute of Technology and Management', 'HITAM', 'Medchal, Hyderabad', 'Telangana', 'hitam.org', 'College'],
  ['TKR College of Engineering and Technology', 'TKRCET', 'Meerpet, Hyderabad', 'Telangana', 'tkrcet.ac.in', 'College'],
  ['Guru Nanak Institutions Technical Campus', 'GNITC', 'Ibrahimpatnam, Hyderabad', 'Telangana', 'gniindia.org', 'College'],
  ['Kakatiya Institute of Technology and Science', 'KITS Warangal', 'Warangal', 'Telangana', 'kitsw.ac.in', 'College'],

  // ---------- Branch campuses of multi-campus universities ----------
  ['BITS Pilani – K K Birla Goa Campus', 'BITS Goa', 'Zuarinagar', 'Goa', 'bits-pilani.ac.in', 'Deemed University'],
  ['GITAM (Deemed to be University) – Bengaluru Campus', 'GITAM Bengaluru', 'Bengaluru', 'Karnataka', 'gitam.edu', 'Deemed University'],
  ['Vellore Institute of Technology – Chennai Campus', 'VIT Chennai', 'Chennai', 'Tamil Nadu', 'vit.ac.in', 'Deemed University'],
  ['VIT Bhopal University', 'VIT Bhopal', 'Bhopal', 'Madhya Pradesh', 'vitbhopal.ac.in', 'Private University'],
  ['Amrita Vishwa Vidyapeetham – Bengaluru Campus', 'Amrita Bengaluru', 'Bengaluru', 'Karnataka', 'amrita.edu', 'Deemed University'],
  ['Amrita Vishwa Vidyapeetham – Amritapuri Campus', 'Amrita Amritapuri', 'Kollam', 'Kerala', 'amrita.edu', 'Deemed University'],
  ['SRM Institute of Science and Technology – NCR Campus', 'SRM NCR', 'Ghaziabad', 'Uttar Pradesh', 'srmist.edu.in', 'Deemed University'],
  ['Manipal Institute of Technology Bengaluru', 'MIT Bengaluru', 'Bengaluru', 'Karnataka', 'manipal.edu', 'Deemed University'],
  ['Amity University – Hyderabad Campus', 'Amity Hyderabad', 'Hyderabad', 'Telangana', 'amity.edu', 'Private University'],
  ['Symbiosis International University – Hyderabad Campus', 'Symbiosis Hyderabad', 'Hyderabad', 'Telangana', 'siu.edu.in', 'Deemed University'],

  // ---------- Andhra Pradesh ----------
  ['Andhra University', 'Andhra University', 'Visakhapatnam', 'Andhra Pradesh', 'andhrauniversity.edu.in', 'State University'],
  ['Jawaharlal Nehru Technological University Kakinada', 'JNTU Kakinada', 'Kakinada', 'Andhra Pradesh', 'jntuk.edu.in', 'State University'],
  ['Jawaharlal Nehru Technological University Anantapur', 'JNTU Anantapur', 'Anantapur', 'Andhra Pradesh', 'jntua.ac.in', 'State University'],
  ['Sri Venkateswara University', 'SV University', 'Tirupati', 'Andhra Pradesh', 'svuniversity.edu.in', 'State University'],
  ['Acharya Nagarjuna University', 'ANU', 'Guntur', 'Andhra Pradesh', 'nagarjunauniversity.ac.in', 'State University'],
  ['GITAM (Deemed to be University)', 'GITAM', 'Visakhapatnam', 'Andhra Pradesh', 'gitam.edu', 'Deemed University'],
  ['Koneru Lakshmaiah Education Foundation (KL University) – Main Campus, Vaddeswaram', 'KL University Vaddeswaram', 'Vaddeswaram, Guntur', 'Andhra Pradesh', 'kluniversity.in', 'Deemed University'],
  ["Vignan's Foundation for Science, Technology and Research", 'Vignan University', 'Guntur', 'Andhra Pradesh', 'vignan.ac.in', 'Deemed University'],
  ['SRM University, AP', 'SRM AP', 'Amaravati', 'Andhra Pradesh', 'srmap.edu.in', 'Private University'],
  ['VIT-AP University', 'VIT-AP', 'Amaravati', 'Andhra Pradesh', 'vitap.ac.in', 'Private University'],

  // ---------- Kerala ----------
  ['Cochin University of Science and Technology', 'CUSAT', 'Kochi', 'Kerala', 'cusat.ac.in', 'State University'],
  ['University of Kerala', 'Kerala University', 'Thiruvananthapuram', 'Kerala', 'keralauniversity.ac.in', 'State University'],
  ['Mahatma Gandhi University', 'MG University', 'Kottayam', 'Kerala', 'mgu.ac.in', 'State University'],
  ['College of Engineering Trivandrum', 'CET', 'Thiruvananthapuram', 'Kerala', 'cet.ac.in', 'College'],
  ['TKM College of Engineering', 'TKMCE', 'Kollam', 'Kerala', 'tkmce.ac.in', 'College'],

  // ---------- West Bengal ----------
  ['Jadavpur University', 'Jadavpur University', 'Kolkata', 'West Bengal', 'jaduniv.edu.in', 'State University'],
  ['University of Calcutta', 'Calcutta University', 'Kolkata', 'West Bengal', 'caluniv.ac.in', 'State University'],
  ['Presidency University', 'Presidency University', 'Kolkata', 'West Bengal', 'presiuniv.ac.in', 'State University'],
  ['Indian Institute of Engineering Science and Technology, Shibpur', 'IIEST Shibpur', 'Howrah', 'West Bengal', 'iiests.ac.in', 'Institute'],
  ['Maulana Abul Kalam Azad University of Technology', 'MAKAUT', 'Kolkata', 'West Bengal', 'makautwb.ac.in', 'State University'],
  ['Visva-Bharati University', 'Visva-Bharati', 'Santiniketan', 'West Bengal', 'visva-bharati.ac.in', 'Central University'],
  ["St. Xavier's College, Kolkata", "St. Xavier's Kolkata", 'Kolkata', 'West Bengal', 'sxccal.edu', 'College'],

  // ---------- Gujarat ----------
  ['Nirma University', 'Nirma University', 'Ahmedabad', 'Gujarat', 'nirmauni.ac.in', 'Private University'],
  ['Dhirubhai Ambani Institute of Information and Communication Technology', 'DA-IICT', 'Gandhinagar', 'Gujarat', 'daiict.ac.in', 'Institute'],
  ['The Maharaja Sayajirao University of Baroda', 'MSU Baroda', 'Vadodara', 'Gujarat', 'msubaroda.ac.in', 'State University'],
  ['Gujarat University', 'Gujarat University', 'Ahmedabad', 'Gujarat', 'gujaratuniversity.ac.in', 'State University'],
  ['Pandit Deendayal Energy University', 'PDEU', 'Gandhinagar', 'Gujarat', 'pdpu.ac.in', 'Private University'],

  // ---------- Rajasthan ----------
  ['University of Rajasthan', 'Rajasthan University', 'Jaipur', 'Rajasthan', 'uniraj.ac.in', 'State University'],
  ['The LNM Institute of Information Technology', 'LNMIIT', 'Jaipur', 'Rajasthan', 'lnmiit.ac.in', 'Deemed University'],
  ['Manipal University Jaipur', 'MUJ', 'Jaipur', 'Rajasthan', 'jaipur.manipal.edu', 'Private University'],

  // ---------- Punjab / Haryana / Chandigarh ----------
  ['Thapar Institute of Engineering and Technology', 'Thapar', 'Patiala', 'Punjab', 'thapar.edu', 'Deemed University'],
  ['Lovely Professional University', 'LPU', 'Phagwara', 'Punjab', 'lpu.in', 'Private University'],
  ['Chitkara University', 'Chitkara University', 'Rajpura', 'Punjab', 'chitkara.edu.in', 'Private University'],
  ['Guru Nanak Dev University', 'GNDU', 'Amritsar', 'Punjab', 'gndu.ac.in', 'State University'],
  ['Panjab University', 'Panjab University', 'Chandigarh', 'Chandigarh', 'puchd.ac.in', 'State University'],
  ['Punjab Engineering College', 'PEC Chandigarh', 'Chandigarh', 'Chandigarh', 'pec.ac.in', 'Deemed University'],
  ['Kurukshetra University', 'Kurukshetra University', 'Kurukshetra', 'Haryana', 'kuk.ac.in', 'State University'],
  ['Maharshi Dayanand University', 'MDU Rohtak', 'Rohtak', 'Haryana', 'mdu.ac.in', 'State University'],
  ['Ashoka University', 'Ashoka University', 'Sonipat', 'Haryana', 'ashoka.edu.in', 'Private University'],
  ['O.P. Jindal Global University', 'JGU', 'Sonipat', 'Haryana', 'jgu.edu.in', 'Private University'],

  // ---------- Madhya Pradesh / Chhattisgarh ----------
  ['Rajiv Gandhi Proudyogiki Vishwavidyalaya', 'RGPV', 'Bhopal', 'Madhya Pradesh', 'rgpv.ac.in', 'State University'],
  ['Devi Ahilya Vishwavidyalaya', 'DAVV Indore', 'Indore', 'Madhya Pradesh', 'dauniv.ac.in', 'State University'],
  ['Shri G. S. Institute of Technology and Science', 'SGSITS', 'Indore', 'Madhya Pradesh', 'sgsits.ac.in', 'College'],

  // ---------- Odisha / Jharkhand / Bihar ----------
  ['Kalinga Institute of Industrial Technology', 'KIIT', 'Bhubaneswar', 'Odisha', 'kiit.ac.in', 'Deemed University'],
  ['Utkal University', 'Utkal University', 'Bhubaneswar', 'Odisha', 'utkaluniversity.ac.in', 'State University'],
  ['Veer Surendra Sai University of Technology', 'VSSUT', 'Burla', 'Odisha', 'vssut.ac.in', 'State University'],

  // ---------- North East ----------
  ['Tezpur University', 'Tezpur University', 'Tezpur', 'Assam', 'tezu.ernet.in', 'Central University'],
  ['Gauhati University', 'Gauhati University', 'Guwahati', 'Assam', 'gauhati.ac.in', 'State University'],
  ['North-Eastern Hill University', 'NEHU', 'Shillong', 'Meghalaya', 'nehu.ac.in', 'Central University'],

  // ---------- North ----------
  ['University of Jammu', 'Jammu University', 'Jammu', 'Jammu and Kashmir', 'jammuuniversity.ac.in', 'State University'],
  ['University of Kashmir', 'Kashmir University', 'Srinagar', 'Jammu and Kashmir', 'kashmiruniversity.net', 'State University'],
  ['Himachal Pradesh University', 'HPU Shimla', 'Shimla', 'Himachal Pradesh', 'hpuniv.ac.in', 'State University'],
  ['University of Petroleum and Energy Studies', 'UPES', 'Dehradun', 'Uttarakhand', 'upes.ac.in', 'Private University'],
  ['Goa University', 'Goa University', 'Taleigao', 'Goa', 'unigoa.ac.in', 'State University'],
];

/** Extra search aliases (nicknames students actually type). Keyed by short name. */
const ALIASES = {
  'KL University Vaddeswaram': 'klu kl university klef koneru green fields vijayawada',
  'KL University Aziz Nagar': 'klh klu kl university klef koneru hyderabad azeez nagar moinabad',
  'KL University Bachupally': 'klh klu kl university klef koneru hyderabad bachupalli',
  'BITS Hyderabad': 'bits hyd bphc',
  'BITS Goa': 'bits goa',
  'IIIT Hyderabad': 'iiith',
  'JNTU Hyderabad': 'jntuh',
  'Delhi University': 'du',
  'IISc Bangalore': 'iisc bengaluru',
};

const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

const usedIds = new Set();
const uniqueId = (base) => {
  let id = base;
  let n = 2;
  while (usedIds.has(id)) id = `${base}_${n++}`;
  usedIds.add(id);
  return id;
};

export const COLLEGES = RAW.map(([name, short, city, state, domain, type]) => ({
  id: uniqueId(slugify(short || name)),
  name,
  short,
  city,
  state,
  domain,
  type,
  keywords: [name, short, city, state, type, domain, ALIASES[short] || ''].join(' ').toLowerCase(),
})).sort((a, b) => a.name.localeCompare(b.name));

export const STATES = Array.from(new Set(COLLEGES.map((c) => c.state))).sort();

export const COLLEGE_TYPES = Array.from(new Set(COLLEGES.map((c) => c.type))).sort();

/** Build initials like "IITB" / "NMIT" for monogram crest fallback. */
export const getCollegeInitials = (college) => {
  if (!college) return 'U';
  const source = college.short || college.name || '';
  const stop = new Set(['of', 'and', 'the', 'for', '&', 'at', 'in', '-']);
  const words = source.split(/[\s,()./-]+/).filter((w) => w && !stop.has(w.toLowerCase()));
  if (words.length === 1) return words[0].slice(0, 4).toUpperCase();
  return words
    .map((w) => (/^[A-Z]{2,}$/.test(w) ? w : w[0]))
    .join('')
    .slice(0, 4)
    .toUpperCase();
};

export const getCollegeLogoUrl = (college) =>
  college?.domain ? `https://www.google.com/s2/favicons?domain=${college.domain}&sz=128` : null;
