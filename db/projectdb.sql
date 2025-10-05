-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- 主機： localhost
-- 產生時間： 2025-06-13 12:17:19
-- 伺服器版本： 10.4.27-MariaDB
-- PHP 版本： 8.2.0

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- 資料庫： `projectdb`
--

-- --------------------------------------------------------

--
-- 資料表結構 `issue_tracking`
--

CREATE TABLE `issue_tracking` (
  `id` int(11) NOT NULL,
  `project_id` int(11) DEFAULT NULL,
  `issue_desc` text DEFAULT NULL,
  `issue_date` date DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `owner` varchar(100) DEFAULT NULL,
  `fix_method` text DEFAULT NULL,
  `resolved` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- 傾印資料表的資料 `issue_tracking`
--

INSERT INTO `issue_tracking` (`id`, `project_id`, `issue_desc`, `issue_date`, `status`, `owner`, `fix_method`, `resolved`) VALUES
(1, 1, '2.4G Tx 功率偏低', '2025-05-10', '處理中', 'Allen', '調整測試流程延長量測時間', 0),
(2, 3, '錄音破音，可能與 mic 增益相關', '2025-05-12', '已解決', 'Charles', '降低 mic gain 並更新驅動程式', 1),
(3, 2, 'HDMI 無法輸出影像', '2025-05-08', '待確認', 'Betty', '', 0);

-- --------------------------------------------------------

--
-- 資料表結構 `projects`
--

CREATE TABLE `projects` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `customer` varchar(100) NOT NULL,
  `model` varchar(100) DEFAULT NULL,
  `sku` varchar(100) DEFAULT NULL,
  `owner` varchar(100) DEFAULT NULL,
  `stage` varchar(50) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `summary_link` varchar(255) DEFAULT NULL,
  `sfis_version` varchar(100) DEFAULT NULL,
  `tasks_count` smallint(6) NOT NULL,
  `issues_count` smallint(6) NOT NULL,
  `begin_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `site_count` int(11) DEFAULT NULL,
  `target_test_time` float DEFAULT NULL,
  `risk_level` varchar(10) DEFAULT NULL,
  `spec_link` varchar(255) DEFAULT NULL,
  `issue_link` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- 傾印資料表的資料 `projects`
--

INSERT INTO `projects` (`id`, `name`, `customer`, `model`, `sku`, `owner`, `stage`, `status`, `sfis_version`, `tasks_count`, `issues_count`, `begin_date`, `end_date`, `site_count`, `target_test_time`, `risk_level`, `spec_link`, `issue_link`, `summary_link`, `created_at`) VALUES
(1, 'RedSky2', 'Amazon', 'RedSky2', 'US', 'Stone', 'MP', '啟動中', 'v1.3.5', 1, 0, '2025-05-05', '2025-06-14', 2, 3.5, '中', 'specs/redsky2.pdf', 'issues/redsky2.xlsx', NULL, '2025-05-13 16:52:30'),
(2, 'FGM234BFWB', 'Vantiva', 'FGM234BFWB', '', 'Jodimas/Christopher', 'PR2', '封板中', '', 0, 1, '2025-05-26', '2025-05-31', 1, 2, '高', '', '', NULL, '2025-05-13 16:52:30'),
(3, 'DGM434BFWB', 'Vantiva', 'DGM434BFWB', '', 'Jodimas/Christopher', 'PR', '封板中', 'v0.9-beta', 1, 0, '2025-05-19', '2025-05-23', 3, 4.2, '低', 'specs/aurora_v1.pdf', '', NULL, '2025-05-13 16:52:30'),
(4, '日常管理事務', 'PEGATRON', '', '', 'Stone', '', '驗證中', NULL, 4, 0, '2022-04-26', '2030-12-31', NULL, NULL, NULL, '', NULL, NULL, '2025-06-02 09:27:10'),
(5, 'DTIW3930 TIM', 'Sagemcom', 'DTIW3930 TIM', '', 'Yusup', 'ER', '啟動中', 'v1.0-final', 0, 0, '2025-05-26', '2025-05-30', 2, 2.7, '中', 'specs/delta_temp.pdf', '', NULL, '2025-05-13 16:52:30'),
(6, 'OWA834BFWB', 'Vantiva', 'OWA834BFWB', '', 'Jodimas/Christopher', 'MP', '啟動中', NULL, 1, 0, '2025-05-19', '2025-05-24', NULL, NULL, NULL, NULL, NULL, NULL, '2025-05-26 16:34:02'),
(7, 'UIW4057', 'Vantiva', 'UIW4057', '', 'Stone', 'MP', '啟動中', NULL, 1, 0, '2025-06-02', '2025-06-06', NULL, NULL, NULL, NULL, NULL, NULL, '2025-05-26 16:43:15'),
(8, '​VSB3918', 'Sagemcom', '', 'Linknet', 'Yusup', 'PR', '驗證中', NULL, 0, 0, '2025-06-10', '2025-06-14', NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-02 08:27:13'),
(9, '​VSB3918', 'Sagemcom', '', 'KPN', 'Yusup', 'ER', '驗證中', NULL, 0, 0, '2025-07-26', '2025-08-02', NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-02 08:30:56'),
(10, 'DIW252', 'Sagemcom', '', 'ENTEL', 'Vicko', 'ER', '驗證中', NULL, 0, 0, '2025-06-30', '2025-07-05', NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-02 08:30:56'),
(11, 'DIW252', 'Sagemcom', '', 'LOWI', 'Vicko', 'MP', '驗證中', NULL, 0, 0, '2025-06-02', '2025-06-07', NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-02 08:30:56'),
(12, 'DIW3930', 'Sagemcom', '', 'Cogeco', 'Fildany', 'MP', '驗證中', NULL, 0, 0, '2025-06-16', '2025-06-21', NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-02 08:35:56'),
(13, 'DIW253', 'Sagemcom', '', 'VDF', 'Vicko', 'ER', '驗證中', NULL, 0, 1, '2025-06-09', '2025-06-14', NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-02 08:38:56'),
(14, 'DCIW378', 'Sagemcom', '', '', 'Fildany', 'MP', '驗證中', NULL, 0, 1, '2025-06-09', '2025-06-14', NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-02 08:39:56'),
(15, 'UIW4084BYT', 'Vantiva', '', '', 'Riona', 'ER', '驗證中', NULL, 0, 0, '2025-12-01', '2025-12-13', NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-02 08:42:13'),
(16, 'UIW4060MCS3', 'Vantiva', '', '', 'Riona', 'PR', '啟動中', NULL, 0, 0, '2025-06-09', '2025-06-14', NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-02 08:43:13'),
(17, 'UIW7057DTAMB', 'Vantiva', '', '', 'Riona', 'ER', '驗證中', NULL, 0, 1, '2025-06-23', '2025-07-05', NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-02 08:45:45'),
(18, 'AOS_GEN3', 'Aetheros', '', 'SKU1', 'Caroline', 'ER', '驗證中', NULL, 0, 0, '2025-07-21', '2025-08-02', NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-02 08:47:55'),
(19, 'AOS_GEN3', 'Aetheros​', '', 'SKU5A', 'Caroline', 'ER', '驗證中', NULL, 0, 0, '2025-11-03', '2025-11-08', NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-02 08:49:35'),
(20, 'RaptorV3', 'PEGATRON', '3600', '​​​​Gen', 'Yuda', 'MP', '驗證中', NULL, 0, 0, '2025-06-10', '2025-06-14', NULL, NULL, NULL, '3600(4 Wi-Fi Ant. 6 LTE Ant.)\r\n1800(2 Wi-Fi Ant. 6 LTE Ant.)', NULL, NULL, '2025-06-02 08:55:35'),
(21, 'RaptorV3', 'PEGATRON', '3600', 'Etisalat​', 'Yuda', 'PR', '驗證中', NULL, 0, 0, '2025-06-10', '2025-06-14', NULL, NULL, NULL, '3600(4 Wi-Fi Ant. 6 LTE Ant.)\nRJ-11', NULL, NULL, '2025-06-02 08:58:35'),
(22, 'Muscat', 'PEGATRON', '', '5GCam', 'Nancy', 'ER', '啟動中', NULL, 0, 0, '2025-05-14', '2025-06-02', NULL, NULL, NULL, '', NULL, NULL, '2025-06-02 09:02:20'),
(23, 'Kangaron', 'PEGATRON', '', 'CBNG', 'Yuda', 'PR', '啟動中', NULL, 0, 0, '2025-06-05', '2025-06-07', NULL, NULL, NULL, '', NULL, NULL, '2025-06-02 09:07:20'),
(24, 'PuckE', 'PEGATRON', '', '', 'Nancy/Yuda', 'ER', '驗證中', NULL, 0, 0, '2025-06-25', '2025-07-05', NULL, NULL, NULL, '', NULL, NULL, '2025-06-02 09:09:45'),
(25, 'Rex2', 'PEGATRON', '', '', 'Nancy', 'ER', '驗證中', NULL, 0, 0, '2025-07-07', '2025-07-12', NULL, NULL, NULL, '', NULL, NULL, '2025-06-02 09:11:45'),
(26, 'HaLow Cam​', 'Vantiva', '', '', 'Derrie', 'MP', '驗證中', NULL, 0, 0, '2025-06-09', '2025-06-21', NULL, NULL, NULL, '', NULL, NULL, '2025-06-02 09:13:49'),
(27, 'NewPeak', 'Vantiva', '', '', 'Derrie', 'ER', '驗證中', NULL, 0, 0, '2025-10-20', '2025-11-01', NULL, NULL, NULL, '', NULL, NULL, '2025-06-02 09:17:15'),
(28, 'Lory', 'Arlo', '', '', 'Joe', 'ER', '驗證中', NULL, 0, 0, '2025-07-07', '2025-07-19', NULL, NULL, NULL, '', NULL, NULL, '2025-06-02 09:18:25'),
(29, 'Finch', 'SimpliSafe', '', '', 'Derrie(Leader)', 'ER', '驗證中', NULL, 0, 0, '2025-08-25', '2025-09-06', NULL, NULL, NULL, '', NULL, NULL, '2025-06-02 09:19:50'),
(30, 'CVA438ZVBV5', 'Vantiva', '', '', 'Jodimas/Christopher', 'MP', '驗證中', NULL, 0, 0, '2025-07-07', '2025-07-19', NULL, NULL, NULL, '', NULL, NULL, '2025-06-02 09:24:55'),
(31, 'CVA438ZVATU', 'Vantiva', '', '', 'Jodimas/Christopher', 'MP', '驗證中', NULL, 0, 0, '2025-06-16', '2025-06-28', NULL, NULL, NULL, '', NULL, NULL, '2025-06-02 09:26:15'),
(32, 'SBG50CGA438A', 'Vantiva', '', '', 'Jodimas/Christopher', 'FGR', '驗證中', NULL, 0, 0, '2025-07-14', '2025-07-26', NULL, NULL, NULL, '', NULL, NULL, '2025-06-02 09:27:10');

-- --------------------------------------------------------

--
-- 資料表結構 `project_issues`
--

CREATE TABLE `project_issues` (
  `id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL,
  `issue_title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('In Progress','Pending','Resolved','Closed') DEFAULT 'In Progress',
  `owner` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 傾印資料表的資料 `project_issues`
--

INSERT INTO `project_issues` (`id`, `project_id`, `issue_title`, `description`, `status`, `owner`, `created_at`) VALUES
(1, 1, '123', '', 'Pending', 'Stone', NULL, '2025-05-17 03:33:52'),
(2, 1, '234', '', 'Pending', 'Stone', NULL, '2025-05-17 03:34:04'),
(3, 2, '...', '', 'In Progress', 'Christopher', NULL, '2025-05-17 03:38:40'),
(4, 1, 'F0的iPLAS無法上傳log', NULL, 'Resolved', 'Stone', NULL, '2025-05-19 08:10:20'),
(5, 1, 'debug', 'debug', 'Resolved', 'Es Batu', NULL, '2025-05-19 08:11:21'),
(6, 1, 'new issue', '', 'Resolved', 'Stone', NULL, '2025-05-31 07:09:36'),
(7, 1, '計算issue的數量並更新至projects表格中', '', 'Closed', 'Stone', NULL, '2025-05-31 09:23:48'),
(8, 1, '計算issue的數量並更新至projects表格中 - 2', '', 'Resolved', 'Stone', NULL, '2025-05-31 09:27:27'),
(9, 3, 'add a new issue', '', 'Closed', 'Jodimas', NULL, '2025-05-31 13:59:46'),
(10, 14, 'CADB拿不到STBSN', NULL, 'In Progress', 'Vicko', NULL, '2025-06-09 01:20:28'),
(11, 13, 'CADB拿不到STBSN', '客人回覆負責人還在休假，預計6/9解決。', 'In Progress', 'Vicko', NULL, '2025-06-09 01:20:39'),
(12, 17, '客戶測試程式有問題', '環境架不起來，程式開啟一直報錯。\n客人會先驗好Provision, PEGA只負責寫KEY，其他功能就先不測了。\n6/11(三)客人會給一版只寫KEY的測試程式。', 'In Progress', 'Jodimas/Christopher', NULL, '2025-06-09 01:24:52');

-- --------------------------------------------------------

--
-- 資料表結構 `project_tasks`
--

CREATE TABLE `project_tasks` (
  `id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL,
  `task_title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('Pending','Ongoing','Done') DEFAULT 'Pending',
  `owner` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 傾印資料表的資料 `project_tasks`
--

INSERT INTO `project_tasks` (`id`, `project_id`, `task_title`, `description`, `status`, `owner`, `created_at`) VALUES
(2, 1, '123', NULL, 'Done', '123', NULL, '2025-05-17 05:25:41'),
(3, 1, '234', '', 'Done', '234', NULL, '2025-05-17 05:30:35'),
(4, 4, 'MUHAMMAD LUTHFI JULIANDRI(New2)', 'MUHAMMAD LUTHFI JULIANDRI\n\n085156347815 | mluthfijuliandri@gmail.com | Batam, Kepulauan Riau\nWebsite: www.juliandri.xyz\nLinkedIn: www.linkedin.com/in/luthfijuliandri\nGitHub: www.github.com/luthfijuliandri\n\nABOUT ME\nI am a Software Engineer with a solid foundation in both machine learning and full-stack development. With experience building intelligent, data-driven systems and scalable web and mobile applications, I bridge the gap between AI solutions and practical, user-friendly software products. My expertise includes end-to-end machine learning using TensorFlow, as well as web technologies such as PHP, Laravel, JavaScript, and responsive front-end frameworks. I’ve built and deployed real-time computer vision applications integrated with IoT, and I’m passionate about developing impactful software that solves real-world problems. Through continuous learning in programs like Bangkit Academy and professional internships, I aim to contribute to the tech industry with innovation and integrity.\n\nWORK EXPERIENCE\nBatam Print October 2023 – December 2023\nWeb Developer Intern\n        • Assist in developing and maintaining responsive websites and web applications to meet \n           client needs.\n        • Write clean front-end code using HTML, CSS, and JavaScript while supporting back-end \n           development with PHP.\n        • Conduct testing and debugging to ensure optimal performance, usability, and cross- \n           browser compatibility.\n        • Troubleshoot technical issues and stay updated on web development trends to improve \n           functionality and efficiency.\n\nPT. Vortex Energy Batam September 2024 – January 2025\nMachine Learning Engineer Intern\n        • Designed and implemented a computer vision system integrated with IoT-based cameras \n           to detect and count production items in a manufacturing environment.\n        • Developed object detection models using TensorFlow and trained them to accurately \n           classify and count products in real-time.\n        • Built a data pipeline for capturing image frames, processing them, and feeding them to \n           the ML model for analysis.\n        • Deployed the solution on edge devices, ensuring low-latency inference suitable for real- \n           time industrial use cases.\n\nEDUCATION\nUniversitas Pancasila September 2021 – February 2025\nTeknik Informatika Strata 1 | 7th Semester GPA 3.76/4.00\n        • Learning Mobile Development, focusing on building efficient, user-friendly applications \n           for Android and iOS platforms.\n        • Learning Web Development, with a focus on front-end and back-end technologies, \n           including HTML, CSS, JavaScript, and databases.\n        • Learning Machine Learning, including supervised and unsupervised learning, model \n           optimization, and practical applications in data analysis.\n\nBangkit Academy led by Google, Tokopedia, Gojek, & Traveloka February 2024 – July 2024\n        • Learning core machine learning concepts, including supervised and unsupervised \n           learning, model evaluation, and optimization techniques.\n        • Learning how to preprocess data and implement machine learning algorithms using Python and relevant libraries.\n        • Completing a capstone project focused on solving real-world problems by applying the                       \n           learned machine learning techniques.\n\nORGANIZATION EXPERIENCE\nPersatuan Perusahaan Periklanan Indonesia December 2023 – now\n\nMember\n        • Member of Persatuan Perusahaan Periklanan Indonesia (P3I), gaining insights into         \n           advertising trends and best practices.\n        • Learning about industry standards and ethical advertising practices.\n        • Engaging in discussions on innovative marketing strategies and regulations.\n\nSKILLS\nLanguages: English (Fluent), Bahasa Indonesia\nSoft skill: Python, Java, C++, PHP, HTML & CSS, Laravel 11, TensorFlow\n\nCERTIFICATIONS\n• Sequences, Time Series and Prediction (DeepLearning.AI)\n• Browser-based Models with TensorFlow.js (DeepLearning.AI)\n• Data Pipelines with TensorFlow Data Services (DeepLearning.AI)\n• Custom Models, Layers, and Loss Functions with TensorFlow (DeepLearning.AI)\n• Convolutional Neural Networks in TensorFlow (DeepLearning.AI)\n• Natural Language Processing in TensorFlow (DeepLearning.AI)\n• Device-based Models with TensorFlow Lite (DeepLearning.AI)\n• Advanced Deployment Scenarios with TensorFlow (DeepLearning.AI)\n• Structuring Machine Learning Projects (DeepLearning.AI)\n• Custom and Distributed Training with TensorFlow (DeepLearning.AI)\n• Introduction to TensorFlow for Artificial Intelligence, Machine Learning, and Deep Learning (DeepLearning.AI)\n• Probability & Statistics for Machine Learning & Data Science (DeepLearning.AI)\n• Linear Algebra for Machine Learning and Data Science (DeepLearning.AI)\n• Advanced Learning Algorithms (DeepLearning.AI, Stanford University)\n• Supervised Machine Learning: Regression and Classification (DeepLearning.AI, Stanford University)\n• Share Data Through the Art of Visualization (Google)\n• Unsupervised Learning, Recommenders, Reinforcement Learning (DeepLearning.AI, Stanford University)\n• Analyze Data to Answer Questions (Google)\n• Calculus for Machine Learning and Data Science (DeepLearning.AI)\n• Process Data from Dirty to Clean (Google)\n• Introduction to Git and GitHub (Google)\n• Using Python to Interact with the Operating System (Google)\n• Crash Course on Python (Google)\n• Ask Questions to Make Data-Driven Decisions (Google)\n• Foundations: Data, Data, Everywhere (Google)\n• Prepare Data for Exploration (Google)', 'Ongoing', 'Stone', NULL, '2025-05-19 10:01:07'),
(5, 4, 'Akfan Wahyu Wardhana(New3)', 'Akfan Wahyu Wardhana\nMojokerto, East Java | wardhanawon@gmail.com | +6282228691953 | linkedin.com/in/akfan-wahyu-wardhana-63536b1b4\n\nABOUT ME\nA graduate of Electrical Engineering Education, majoring in Electrical Engineering at the State University of Malang. Interested in the field of\nelectrical engineering, especially instrumentation and hardware software programs. Also experienced in related fields such as IoT, Robotics, Electrical\nDesign, Programmable Logic Controller, Industrial Automation, front-end development, back-end development, data analysis, and project\nmanagement. Accustomed to working in a team and have strong analytical skills.\n\nEDUCATION\nUniversitas Negeri Malang Malang, Indonesia\n- S1 Pendidikan Teknik Elektro, GPA: 3.8/4.00 2021 – 2025\nSMA Negeri 2 Kota Mojokerto Malang, Indonesia\n- Ilmu Pengetahuan Alam : 85, 47\n\nSKILLS\n2018 – 2021\nTechnical: K3 Electrical Instalation, Flutter, Google Firebase, Adobe Photoshop, Figma, Android Studio, Visual Studio Code, Corel Draw, Etap,\nProteus Professional, Easy Eda, Inventor, SketchUp, Instalasi Listrik, Robotika, IoT, Programmable Logic Controller,\nIndustry Otomations, Microsoft Office, IMB SPSS, Arduino, MATLAB, Data Analyst, SQL,\nProgramable Language (C++, C, C#)\nAnother Skill : Public Speaking, Marketing, interpersonal, Time Management.\nLanguages: Indonesia, English (Development)\n\nWORK EXPERIENCE\nUniversitas Negeri Malang\nResearch and Development of Faculty of Engineering UM Malang, Indonesia\nJunior Software and Hardware Electrical Engineering, – Part time Jun 2023 – Aug 2024\n• Creating IoT applications\n• Designing the electrical system of the device\n• Creating national and international research journals\n• Creating research and development management planning\nUniversitas Negeri Malang Malang, Indonesia\nLaboratory Assistant– Part time Aug 2022 – Des 2022\n• Handling the Basic Hardware Programming practicum for 50++ students\n• Collaborating with lecturers\n• Preparing Activity Report Proposals\nUniversitas Negeri Malang\nResearch and Development of Faculty of Engineering UM Malang, Indonesia\nJunior Software and Hardware Electrical Engineering, – Part time Jan 2022 – Jun 2023\n• Developing IoT Applications\n• Designing the Electrical System of the Device\n• Designing Solar Panel Systems\n• Creating National and International Research Journals\n• Planning of Tool Design\n• Planning the installation of the building\'s electrical system\n• System analysis using MATLAB Simulink application\n• Hardware programming with Arduino IDE\n• Implementation of K3 electrical systems\n• Maintenance of electrical equipment and materials\n• Programable development of analog and digital systems with C# and C++ language.\n\nCOMMITTEE EXPERIENCE\n• CAMPUS EXPO SMANDA 2022- 2023\n- Design Graphic Division\n• Line Tracer Design And Contest Nasional Okt 2022\n- Referee\n- Field Coordinator\n- Contest participant judging team\n• Trade and Expo Nov 2024\n- Vice Event Coordinator\n\nVOLUNTEER EXPERIENCE\n• NAKO-HMD-FT-UM Des 2022\n- Design Division\n• MakeX Starter Zero Carbon Okt 2022\n- Referee\n- Field Coordinator\n• Juri Lomba Desain Kreativitas Okt 2022\n- Evaluation Team\n• Online Course Presenter Nov 2022\n- Explained Digital Electronic\n- Explained Analog Electronic\n• Innovation Event Presenter Mojokerto City Jun 2022\n- Presentation of innovative scientific work related to renewable technology for the city of Mojokerto\n- Carry out a project contract with the Mojokerto city government\n\nINDUSTRIAL INTERNSHIP EXPERIENCE\n• PLN ULP KRIAN Jun 2024 – Sept 2024\n- Engineer Division\n- Administration Division\n\nAWARD CERTIFICATION\n• HKI Application Program Smart Tour of Islamic History Des 2023\n- Junior Application Developer\n• HKI SMAGLATOR (Smart Glasses Translator) Programable Nov 2023\n- Create a sign language detection system application using the random forest algorithm\n- Create Programable Logic System with C++ Language and C#\n• HKI Application Program Sobat Flora Nov 2022\n- Create a image clasification system application using the tensorflow algorithm\n- Create Programable Logic System with C++ Language and C# Language\n• HKI Simulation Design IDRIS 2022\n- Create Programable Logic System with C++ and C# Language to configuration with IoT Controller\n- Create IoT Application with firebase database to controll and real time monitoring system\n• HKI Application Design IDRIS 2022\n- Create design application before to implementation\n• Design Graphic, Mojokerto City 2021\n- Create Application Design\n- Create Website Design\n\nORGANIZATION\n• Workshop Elekro UM Jun 2022 – Jan 2024\n- Robotic Division\n- General Head of Organisation\n• Komunitas Teknik Care Jun 2022 – Oct 2024\n- Education Devision\n• IMAPRES UM Mar 2023 – Apr 2024\n- IT Devision\n• PPI KOTA MOJOKERTO 2019 – 2022\n- General Head of PASKIBRAKA Mojokerto City\n• OSIS SMAN 2 KOTA MOJOKERTO 2018 – 2020\n- Leadership Division\n• Komunitas Desain Grafis SMAN 2 Kota Mojokerto 2018 – 2020\n- Graphic Design Division\n\nPREFISIONAL CERTIFICATION\n• Internet Of Things Jan 2025\n- Create Programable Logic Microcontroller with C++ and C# Language to Configuration with Web or Apps.\n\nAWARD COMPETITION\n• Medali Bronze Nov 2023\n- International Poster Award\n\n• Medali Silver Oct 2023\n- International Competition for Innovation in Mathematics and Science Education\n\n• KRTI Indonesia Oct 2023\n- Regional Participant Award for Technology Development (PSD) ESC/ECU\n\n• Excelenced Award 2023\n- The 18th Digital Signal Processing Creative Design Contest international Taiwan\n\n• GEMASTIK Sept 2023\n- Finalis Smart System, Embedded, IoT Division\n\n• Third Place March 2023\n- FESMARO Competition (LKTI)\n\n• Third Place April 2023\n- IMAPRES FT UM (Best Achieving Student in the Faculty of Engineering UM)\n\n• Best Speaker Sept 2022\n- NITC (National IT Competitions) Award\n\n• UI Design Competition Indosat Oredoo Sept 2022\n- Stage award Empathize and Validation\n\n• Third Place Winner Nov 2020\n- Design of the Koningen Uniform for POPNAS East Java\n\n• Delegation “International Youth Student Development” Apr 2020\n- International Certificate of Forum Pemuda Kota Mojokerto\n\n• Participant Award Jan 2020\n- Olimpiade Farmasi Universitas Airlangga\n\n• Award for Representative of Senior High School of Mojokerto City Nov 2019\n- LDKS High School East Java\n\n• Award for DJP Activities in Mojokerto City 2019\n- Program for Tax Awareness Inclusion in Order to Realize a Smart and Tax-Conscious Generation\n\n• Award for National Dialogue Activities Dec 2018\n- The Role of the Millennial Generation of East Java in Preserving and Maintaining the Unity of the Unitary State of the Republic of Indonesia\n\n• Award for Competition Participants Feb 2018\n- Islamic Arts Festival Competition CCI\n\n• Scout Level Competition Achievement Award Apr 2018\n- Scout Competition Level 1 East Java', 'Ongoing', 'Stone', NULL, '2025-05-19 10:01:17'),
(6, 4, 'Atha Ezrafi(New4)', 'Atha Ezrafi\nPekanbaru • 087718047671 • athaezrafi20@gmail.com\n• linkedin.com/in/atha-ezrafi\n\nFresh graduate of Gunadarma University with a degree in Computer Systems, experienced in software development, code testing, debugging, and troubleshooting. Proficient in Python, C++, PHP, CSS, HTML, JavaScript, Java, Selenium, and Jira for delivering reliable programming solutions. Completed a virtual internship as a Big Data Analyst at Rakamin x Kimia Farma, analyzing 10.000 datasets and providing actionable insights to improve business performance. Developed a hydroponic monitoring system as part of an IoT project, creating software to manage environmental factors and enhance operational efficiency in hydroponic farming. Authored a guidebook as a Research Assistant, standardizing lab procedures, reducing errors by 40%, and saving an average of two hours per experiment by streamlining processes. Dedicated to creating efficient, scalable systems that meet project goals and deliver measurable impact.\n古納達瑪大學電腦系統專業應屆畢業生，在軟體開發、程式碼測試、調試和故障排除方面經驗豐富。精通 Python、C++、PHP、CSS、HTML、JavaScript、Java、Selenium 和 Jira，能夠提供可靠的程式解決方案。在 Rakamin x Kimia Farma 完成了大數據分析師的線上實習，分析了 10,000 個資料集，並提供了切實可行的見解以提升業務績效。作為物聯網專案的一部分，開發了一套水耕監測系統，該軟體用於管理環境因素並提高水耕農業的營運效率。作為研究助理，編寫了一本指南，透過簡化流程，標準化了實驗室程序，減少了 40% 的錯誤，平均每個實驗節省了兩小時。致力於創建高效、可擴展的系統，以滿足專案目標並產生可衡量的影響。\n\nEDUCATION\nGunadarma University | Computer System • 08/2019 - 02/2023\nGPA: 3.43 / 4.00\nSubject Covering: • Python • Arduino IDE • Critical Thinking • Problem Solving • SQL • HTML • Javascript • CSS\n\nPROFESSIONAL EXPERIENCE\nProject-Based Virtual Intern : Big Data Analytics Kimia Farma x Rakamin Academy •06/2024 – 07/2024\n Evaluated business performance from 2020 to 2023, leveraging analytical skills to identify trends and opportunities for improvement.\n Imported and managed 10.000 datasets in BigQuery.\n Conducted in-depth data analysis to support strategic decision-making.\n Designed comprehensive dashboards in Looker Studio to visualize business performance metrics.\n Utilized Tableau to present data in an intuitive and accessible format for stakeholders.\n Key Projects:\n Developed a Year-over-Year Revenue Comparison dashboard to identify revenue trends and patterns.\n Created an interactive Geo Map in Looker Studio to visualize total profit by province, aiding in regional performance analysis.\n Built a Top 10 Transactions by Province dashboard to highlight high-performing regions and focus business strategies.\n Designed a Top 5 Branches with Highest Ratings but Lowest Transaction Ratings report to pinpoint areas for service improvement.\nGunadarma University • 02/2021 - 09/2023\nResearch Assistant\n Maintained accurate record of laboratory inventories, ensuring 100% inventory visibility\nand reducing the risk of equipment shortage or excess\n Authored a comprehensive and user-friendly lab experiment guidebook, demonstrating\nstrong communication and technical writing skills.\n Enhanced the learning process for students and researchers, and contributed 80% to\nthe overall efficiency of lab operations\n Taught Gunadarma University students regarding of robots\n Reducing errors by 40%, and saving an average of two hours per experiment by\nstreamlining processes\n Create a IOT project called “Hydroponic Monitoring System Integrated With ESP32-\nBased BLYNK”\n Troubleshoot, Debugging, maintaining robotics equipment such as tools, robots and\nnetworks\n\nORGANIZATION EXPERIENCE\nEmbedded System Competition (ESC) • 02/2023\nCommittee Equipment Section\n Embedded System Competition (ESC) is one of Gunadarma’s big Event with the aim\nintroducing Robotics Throughout all Gunadarma Campus Region with a total more\nthan 150 participant\n\nSKILLS\nSoft Skill : Public Speaking (MC, Moderator), Problem Solving, Teamwork,\nAdaptabilty, Communication, Critical Thinking, Attention to detail\nHard Skill : Troubleshooting, Debugging, Technical Writing, Hardware\nMaintenance\nTools : Arduino IDE, Microsoft Office, Python, Internet of Things (IoT), Blynk, SQL\n(Programming language), Looker Studio, MySQL, BigQuery, Tableau,\nC++, Java, Selenium, Jira, PHP, CSS, HTML, Javascript, Pandas\nLanguage : Indonesia (Native), English (Intermediate)\n\nCERTIFICATIONS\nNetwork Security and Optimization\nUniversity of Gunadarma • 06/2023\nNetwork Design and Configuration\nUniversity of Gunadarma • 03/2023\nComputer Networks Performance Optimization\nUniversity of Gunadarma • 06/2022\nComputer Networks Failure Tracking and Recovery\nUniversity of Gunadarma • 03/2022\nProject-Based Virtual Intern: Big Data Analytics Kimia Farma x Rakamin\nAcademy\nKimia Farma X Rakamin Academy • 06/2024\nProgramming (Fresh Graduate Academy)\nDigital Talent Scholarship • 10/2024\n\nPORTOFOLIO\n Hydroponic Monitoring System Integrated With ESP32-Based BLYNK', 'Ongoing', 'Stone', NULL, '2025-05-19 10:01:32'),
(7, 4, '人員招募New5', '我真的覺得需要在tasks或issues的modal中讓使用者可以看到檔案，也要可以直接拖曳上傳檔案。', 'Ongoing', 'Derrie', NULL, '2025-05-19 10:02:09'),
(8, 3, '新增一台Acoustic治具', '', 'Ongoing', 'Christopher', NULL, '2025-05-20 16:00:21'),
(9, 1, 'buy 3d printer', 'Hello 5', 'Ongoing', 'Yuda', NULL, '2025-05-26 01:57:45'),
(10, 6, 'PC ping LAN1 Port Test Error', '256726100000344\n5/24\n- Check telnet found abnormality\n- Enter command Get_Ethernet_Status -i 0 to DUT can\'t get correct result.\n5/23\n- Check ping and LAN speed OK. NTF', 'Ongoing', 'Jodimas', NULL, '2025-05-26 09:36:21'),
(11, 7, '評估OBA Station自動化測試的可行性', '4054ETI(Technicolor) Production 6/2 ~ 6/10\n4054SAS(Vantiva) Production 6/14 ~ 6/20\nSOP from Suriana\n\n1. 所示插上網線、HDMI線、光纖線和2個U盤（2.0 在後側，3.0 在右側），然後所示按住機台「電源鍵」後再插上電源線上電，等前視板所示左側紅色電源燈閃爍後可鬆開按鍵。\n2. 注意必須先按住「電源鍵」再插電源線上電。\n3. 所示是一些遙控器常用按鍵。\n4. 當電視出現如下圖畫面時，用遙控器調至頻道「8」點選2次「OK」鍵，如下圖所示確認電視畫面和聲音是否正常輸出，然後再按「Back/Return」鍵退出選擇選單，調整音量「+」確認電視聲音是否變大，調整「-」鍵確認電視聲音是否變小，最後輕拍三下機台，確認電視畫面清晰流暢無抖動聲音清楚無雜音。\n5. 遙控器按「#」「#」「0」「0」「*」「*」出現選單，使用遙控器按“退出”， 所示將頻道切至「12」，將HDMI Audio Output改為「Passthrough」，遙控器點擊「OK」確認喇叭聲音是否正常輸出，並調整音量旋鈕確認光纖有聲音輸出音量由小到大，最後切換回「PCM」模式。\n6. 確保在「Passthrough」模式下：電視上的聲音清晰，沒有噪音，揚聲器有聲音。\n7. 確保切換回「PCM」模式。\n8. 確認機台前面板LED是否正常，正常為左燈紅綠交叉閃爍，右燈綠燈閃爍。\n9. 使用遙控器按上下鍵調至頻道「9」\n10. 確保畫面左上角的客戶韌體版本為V.03.01.0152\n11. 依序按下機台上方的「Power」、「CH-」、「CH+」和「RCU」按鈕，每個按鈕5次。\n12. 確認紅色框顯示「OK」並且每個按鍵皆計數到「5」，則按鈕正常。\n13. 紅框內為遙控測試，對準機台任意按壓遙控器數字鍵「0~9」中一個數字即可。\n14. IR Test紅框內所對應顯示「OK」為按鍵正常。\n15. 如下圖為機台I2C晶片檢測，此為上電自檢項目，確認自檢是否顯示「OK」。\n16. 網路線插入機台，Internet Port所對應顯示「OK」，網線拔除Internet Port所對應顯示「NG」。\n17. 所示確認兩個U盤拔除「NG」，兩個U盤插入「OK」，如只插一個U盤將會顯示 （1）\n18. 紅框內為機台客戶KEY（金鑰）檢查，此為上電自檢項目，確認自檢是否顯示「OK」。\n19. 紅框內為機台藍牙功能測試，在測試前需將藍牙Dongle插在PC上，勾選「允許藍牙裝置搜尋這部電腦」，並設定好藍牙名稱「LG_TEST_BT」，此為上電自檢項目，確認自檢是否顯示「OK (-XXdBm）」.\n20. 紅框內為機台SN和MAC，機台底部Label上的SN和MAC比對確認是否一致？\n21. 注意機台MAC為大寫XXXXXXXXXXXX，畫面顯示MAC為小寫xxxx.xxxx.xxxx\n22. 紅色框內為機台HDCP Key，確認該欄位有10位十六進位數值。\n23. 用遙控器按上下鍵切回頻道「12」 -> 「Recovery」 -> 遙控器按「OK」\n24. 按兩次遙控器的「Back/Return」，按遙控器「OK」鍵進入選項「1」，再按「OK」機台開始初始化。\n25. 當電視上的影像消失變黑時，機台初始化完成。\n26. 初始化完成後會出現如圖30畫面。', 'Ongoing', 'Stone', NULL, '2025-05-26 16:00:40'),
(12, 1, 'new task', '', 'Done', 'stone', NULL, '2025-05-31 07:09:14'),
(13, 1, '計算tasks的數量', '', 'Done', 'Stone', NULL, '2025-05-31 09:30:39');

-- --------------------------------------------------------

--
-- 資料表結構 `stations`
--

CREATE TABLE `stations` (
  `idx` int(11) NOT NULL,
  `project_id` int(11) DEFAULT NULL,
  `station_name` varchar(100) DEFAULT NULL,
  `station_dri` varchar(20) DEFAULT NULL,
  `machine_number` tinyint(3) DEFAULT NULL,
  `device_id` varchar(20) DEFAULT NULL,
  `ip_address` varchar(15) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- 傾印資料表的資料 `stations`
--

INSERT INTO `stations` (`idx`, `project_id`, `station_name`, `station_dri`, `machine_number`, `device_id`, `ip_address`) VALUES
(1, 1, 'F0.5', 'Nancy', 0, 'DUT-001', NULL, '192.168.0.101'),
(2, 1, 'F0.5', 'Nancy', 0, 'DUT-002', NULL, '192.168.0.102'),
(3, 2, 'HDMI-T1', 'Vicko', 0, 'HDMI-01', NULL, '192.168.1.11'),
(4, 3, 'AUDIO-T1', 'Vicko', 0, 'MIC-01', NULL, '192.168.2.21'),
(5, 3, 'AUDIO-T2', 'Vicko', 0, 'MIC-02', NULL, '192.168.2.22'),
(8, 5, 'TEMP-CHECK-2', NULL, 0, 'TMP-02', NULL, '192.168.4.42'),
(10, 1, 'F0', 'Stone', 1, '625523', NULL, '192.168.0.149'),
(13, 1, 'F1', 'Yuda', 1, '625534', NULL, '192.168.0.157'),
(14, 1, 'F0', 'Stone', 2, '625524', NULL, '192.168.0.158'),
(15, 5, 'TEMP-CHECK-2', NULL, 1, '123456', NULL, ''),
(16, 1, 'F2', NULL, 1, '623578', NULL, '');

-- --------------------------------------------------------

--
-- 資料表結構 `test_items`
--

CREATE TABLE `test_items` (
  `id` int(11) NOT NULL,
  `project_id` int(11) DEFAULT NULL,
  `item_name` varchar(100) DEFAULT NULL,
  `sub_function` varchar(100) DEFAULT NULL,
  `test_status` varchar(50) DEFAULT NULL,
  `tool_version` varchar(50) DEFAULT NULL,
  `expected_finish` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- 傾印資料表的資料 `test_items`
--

INSERT INTO `test_items` (`id`, `project_id`, `item_name`, `sub_function`, `test_status`, `tool_version`, `expected_finish`) VALUES
(1, 1, 'Tx功率測試', 'RF 2.4G', '完成', 'v1.2', NULL, '2025-06-01'),
(2, 1, 'Rx靈敏度測試', 'RF 5G', '進行中', 'v1.1', NULL, '2025-06-03'),
(3, 2, 'HDMI影像輸出', '1080p', '尚未開始', '', NULL, '2025-06-15'),
(4, 3, 'Mic訊號雜訊比', '音訊前端', '完成', 'v0.8', NULL, '2025-05-20');

--
-- 已傾印資料表的索引
--

--
-- 資料表索引 `issue_tracking`
--
ALTER TABLE `issue_tracking`
  ADD PRIMARY KEY (`id`),
  ADD KEY `project_id` (`project_id`);

--
-- 資料表索引 `projects`
--
ALTER TABLE `projects`
  ADD PRIMARY KEY (`id`);

--
-- 資料表索引 `project_issues`
--
ALTER TABLE `project_issues`
  ADD PRIMARY KEY (`id`),
  ADD KEY `project_id` (`project_id`);

--
-- 資料表索引 `project_tasks`
--
ALTER TABLE `project_tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `project_id` (`project_id`);

--
-- 資料表索引 `stations`
--
ALTER TABLE `stations`
  ADD PRIMARY KEY (`idx`),
  ADD KEY `project_id` (`project_id`);

--
-- 資料表索引 `test_items`
--
ALTER TABLE `test_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `project_id` (`project_id`);

--
-- 在傾印的資料表使用自動遞增(AUTO_INCREMENT)
--

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `issue_tracking`
--
ALTER TABLE `issue_tracking`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `projects`
--
ALTER TABLE `projects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `project_issues`
--
ALTER TABLE `project_issues`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `project_tasks`
--
ALTER TABLE `project_tasks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `stations`
--
ALTER TABLE `stations`
  MODIFY `idx` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `test_items`
--
ALTER TABLE `test_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- 已傾印資料表的限制式
--

--
-- 資料表的限制式 `issue_tracking`
--
ALTER TABLE `issue_tracking`
  ADD CONSTRAINT `issue_tracking_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE;

--
-- 資料表的限制式 `project_issues`
--
ALTER TABLE `project_issues`
  ADD CONSTRAINT `project_issues_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE;

--
-- 資料表的限制式 `project_tasks`
--
ALTER TABLE `project_tasks`
  ADD CONSTRAINT `project_tasks_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE;

--
-- 資料表的限制式 `stations`
--
ALTER TABLE `stations`
  ADD CONSTRAINT `stations_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE;

--
-- 資料表的限制式 `test_items`
--
ALTER TABLE `test_items`
  ADD CONSTRAINT `test_items_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
