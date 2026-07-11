-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: finance_admin
-- ------------------------------------------------------
-- Server version	8.4.7

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `automationjoblog`
--

DROP TABLE IF EXISTS `automationjoblog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `automationjoblog` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `job_type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('PENDING','PROCESSING','COMPLETED','FAILED','PARTIAL_SUCCESS','ROLLED_BACK') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `file_name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `total_rows` int NOT NULL DEFAULT '0',
  `successful_rows` int NOT NULL DEFAULT '0',
  `failed_rows` int NOT NULL DEFAULT '0',
  `error_report` json DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `completed_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `AutomationJobLog_status_idx` (`status`),
  KEY `AutomationJobLog_job_type_idx` (`job_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `automationjoblog`
--

LOCK TABLES `automationjoblog` WRITE;
/*!40000 ALTER TABLE `automationjoblog` DISABLE KEYS */;
/*!40000 ALTER TABLE `automationjoblog` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `category`
--

DROP TABLE IF EXISTS `category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `category` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('INCOME','EXPENSE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `color` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `Category_type_idx` (`type`),
  KEY `Category_userId_idx` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category`
--

LOCK TABLES `category` WRITE;
/*!40000 ALTER TABLE `category` DISABLE KEYS */;
INSERT INTO `category` VALUES ('0104ffd9-59ed-4e36-b299-2a40049ba643','Get together Contribution','EXPENSE','#EF4444','2026-05-24 11:23:58.935','2026-05-24 11:23:58.935',NULL,'cmpjcji0600006anvhatw5jlg'),('0e7f81a0-8b71-4c13-a6b8-900364b59fc7','Dawat-e-Hadiyah','EXPENSE','#EF4444','2026-05-24 11:23:58.946','2026-05-24 11:23:58.946',NULL,'cmpjcji0600006anvhatw5jlg'),('147322bb-4d9a-4cde-9cb7-dcf90db1ec23','Fruit Party Contribution','EXPENSE','#EF4444','2026-05-24 11:23:58.975','2026-05-24 11:23:58.975',NULL,'cmpjcji0600006anvhatw5jlg'),('153d845a-4078-4286-b041-eb8e23242019','Darees Thaal','EXPENSE','#EF4444','2026-05-24 11:23:58.887','2026-05-24 11:23:58.887',NULL,'cmpjcji0600006anvhatw5jlg'),('19c25c00-a50d-46d6-b134-804a6596e2ed','Zabihat Share Amount','EXPENSE','#EF4444','2026-05-24 11:23:58.895','2026-05-24 11:23:58.895',NULL,'cmpjcji0600006anvhatw5jlg'),('21a22cee-9080-4578-8c2a-da3dd1aaf717','Niyaaz Amount Chennai Ashara','EXPENSE','#EF4444','2026-05-24 11:23:58.916','2026-05-24 11:23:58.916',NULL,'cmpjcji0600006anvhatw5jlg'),('23b4dba3-625d-4379-bd39-426f118f1aa6','Darees Tkm Event','EXPENSE','#EF4444','2026-05-24 11:23:58.939','2026-05-24 11:23:58.939',NULL,'cmpjcji0600006anvhatw5jlg'),('27d8098c-6ec0-4b4d-b080-aa3c6c56981a','Adnan Side Contribution Mumbai','EXPENSE','#EF4444','2026-05-24 11:23:58.987','2026-05-24 11:23:58.987',NULL,'cmpjcji0600006anvhatw5jlg'),('4bc3504c-5f19-4048-bdd7-fe7410cb1cd9','Sweets','EXPENSE','#EF4444','2026-05-24 11:23:58.891','2026-05-24 11:23:58.891',NULL,'cmpjcji0600006anvhatw5jlg'),('5306177f-6c6d-41d0-be97-144e064710d7','Savings to Ammi','EXPENSE','#EF4444','2026-05-24 11:23:58.929','2026-05-24 11:23:58.929',NULL,'cmpjcji0600006anvhatw5jlg'),('5aa6b698-7a01-41cc-ac43-a9266bd92a49','Gaming and Lunch(Chicken Affairs)','EXPENSE','#EF4444','2026-05-24 11:23:59.011','2026-05-24 11:23:59.011',NULL,'cmpjcji0600006anvhatw5jlg'),('60279099-6cc6-4147-b1de-b42147f57f85','Gaming and Shawarma','EXPENSE','#EF4444','2026-05-24 11:23:58.965','2026-05-24 11:23:58.965',NULL,'cmpjcji0600006anvhatw5jlg'),('61484de2-5914-40ed-a8ab-95e049ee0eed','Rida Amount to Ammi ','EXPENSE','#EF4444','2026-05-24 11:23:58.932','2026-05-24 11:23:58.932',NULL,'cmpjcji0600006anvhatw5jlg'),('6259fc9a-ef05-4c58-b9eb-e7797c21470d','Contri for Mumbai trip','EXPENSE','#EF4444','2026-05-24 11:23:59.000','2026-05-24 11:23:59.000',NULL,'cmpjcji0600006anvhatw5jlg'),('636bcc13-ba99-4211-90c9-10c9ac188ea2','Aqeeq Silver Ring and Pyride Bracelet for Ammi','EXPENSE','#EF4444','2026-05-24 11:23:59.019','2026-05-24 11:23:59.019',NULL,'cmpjcji0600006anvhatw5jlg'),('68f0382f-4125-45ab-a5c2-490da3f04e69','Petrol Contri Mumbai Trip','EXPENSE','#EF4444','2026-05-24 11:23:58.994','2026-05-24 11:23:58.994',NULL,'cmpjcji0600006anvhatw5jlg'),('6ca6d2af-f65a-47b1-ac04-40dba5a5123a','Self Clothes Shopping','EXPENSE','#EF4444','2026-05-24 11:23:58.951','2026-05-24 11:23:58.951',NULL,'cmpjcji0600006anvhatw5jlg'),('7138a6e9-18e3-4182-8f48-637ea945da15','Ammar Side Contribution Mumbai','EXPENSE','#EF4444','2026-05-24 11:23:58.984','2026-05-24 11:23:58.984',NULL,'cmpjcji0600006anvhatw5jlg'),('72132a4e-92e1-480e-9173-343bc310bc74','Miscellaneous Expense','EXPENSE','#EF4444','2026-05-24 11:23:58.898','2026-05-24 11:23:58.898',NULL,'cmpjcji0600006anvhatw5jlg'),('774837e7-aba9-4b07-bd18-09c0c1558dda','Salary','INCOME','#10B981','2026-05-24 11:23:58.877','2026-05-24 11:23:58.877',NULL,'cmpjcji0600006anvhatw5jlg'),('784c178d-c41d-4544-81eb-58e4f9e95d2d','Vajebaat 1447H','EXPENSE','#EF4444','2026-05-24 11:23:58.968','2026-05-24 11:23:58.968',NULL,'cmpjcji0600006anvhatw5jlg'),('7c8ee11f-eab2-4f2c-9fd6-e1698c1cfb64','Topi For myself','EXPENSE','#EF4444','2026-05-24 11:23:59.007','2026-05-24 11:23:59.007',NULL,'cmpjcji0600006anvhatw5jlg'),('7fab31ae-55f0-410e-8c12-e4a34fbce084','Niyaaz amt','EXPENSE','#EF4444','2026-05-24 11:23:58.906','2026-05-24 11:23:58.906',NULL,'cmpjcji0600006anvhatw5jlg'),('8c53f3a2-47ef-4453-a6d7-45096be1a3c7','Dinner Contri','EXPENSE','#EF4444','2026-05-24 11:23:58.997','2026-05-24 11:23:58.997',NULL,'cmpjcji0600006anvhatw5jlg'),('8ea1c40a-bb4f-4739-ac25-9ca7ade028f9','Contribution for Dinner','EXPENSE','#EF4444','2026-05-24 11:23:58.949','2026-05-24 11:23:58.949',NULL,'cmpjcji0600006anvhatw5jlg'),('94ba41cf-b017-4317-9d22-0e330214ae5e','BBQ Contribution','EXPENSE','#EF4444','2026-05-24 11:23:58.902','2026-05-24 11:23:58.902',NULL,'cmpjcji0600006anvhatw5jlg'),('94fee142-bf4b-42d4-96d1-f213bf38ea92','Eidi to Ammi','EXPENSE','#EF4444','2026-05-24 11:23:58.990','2026-05-24 11:23:58.990',NULL,'cmpjcji0600006anvhatw5jlg'),('a291ad5d-e344-4fcd-a82f-2afd411028a5','Eidi','INCOME','#10B981','2026-05-24 11:24:08.103','2026-05-24 11:24:08.103',NULL,'cmpjcji0600006anvhatw5jlg'),('ab702366-701c-41c6-ab9c-08dff913a9d2','Ammi Salam','EXPENSE','#EF4444','2026-05-24 11:23:58.882','2026-05-24 11:23:58.882',NULL,'cmpjcji0600006anvhatw5jlg'),('ae57f15d-6824-4f73-a17a-ae9f0842860f','Mufaddal Creation(Kurta Saya Set)','EXPENSE','#EF4444','2026-05-24 11:23:58.913','2026-05-24 11:23:58.913',NULL,'cmpjcji0600006anvhatw5jlg'),('b0822292-a9e2-45e8-9ba4-62a47f46b3c0','Coffee Unit Amount','EXPENSE','#EF4444','2026-05-24 11:23:58.978','2026-05-24 11:23:58.978',NULL,'cmpjcji0600006anvhatw5jlg'),('b286bad0-1b9e-4a99-b4a0-1cd63b14e4bb','Lunch Contribution','EXPENSE','#EF4444','2026-05-24 11:23:58.910','2026-05-24 11:23:58.910',NULL,'cmpjcji0600006anvhatw5jlg'),('b3053ad9-ba4a-4408-980a-38256d13a4c4','BreakFast Contri Mumbai','EXPENSE','#EF4444','2026-05-24 11:23:58.981','2026-05-24 11:23:58.981',NULL,'cmpjcji0600006anvhatw5jlg'),('c9d55099-bf3c-48ac-b2fb-246da1977d07','Abba Salam','EXPENSE','#EF4444','2026-05-24 11:23:58.971','2026-05-24 11:23:58.971',NULL,'cmpjcji0600006anvhatw5jlg'),('d05eb8a5-b703-4431-8c53-dbe7e73c15dc','Darees Amount','EXPENSE','#EF4444','2026-05-24 11:23:58.962','2026-05-24 11:23:58.962',NULL,'cmpjcji0600006anvhatw5jlg'),('d15b630d-243e-4b38-b646-a39b9d246ebc','Gift to Zahra Kolhapur','EXPENSE','#EF4444','2026-05-24 11:23:58.926','2026-05-24 11:23:58.926',NULL,'cmpjcji0600006anvhatw5jlg'),('d6865c1b-d21b-40fa-b3e7-f1f2b4a23e61','Religious Offerings','EXPENSE','#EF4444','2026-05-24 11:23:58.956','2026-05-24 11:23:58.956',NULL,'cmpjcji0600006anvhatw5jlg'),('d8cd0f75-5cbd-4943-9154-0ddd475f4c0b','Lawazim till Shawwal 1447H','EXPENSE','#EF4444','2026-05-24 11:23:59.003','2026-05-24 11:23:59.003',NULL,'cmpjcji0600006anvhatw5jlg'),('e3997957-4333-41ad-b993-9ee7992636d2','Pro gaming zone','EXPENSE','#EF4444','2026-05-24 11:23:58.959','2026-05-24 11:23:58.959',NULL,'cmpjcji0600006anvhatw5jlg'),('e649bbe6-76ce-48f0-8618-4583c745dc45','Toloba Lawazim','EXPENSE','#EF4444','2026-05-24 11:23:58.922','2026-05-24 11:23:58.922',NULL,'cmpjcji0600006anvhatw5jlg'),('ea8d9614-68c7-47e0-9679-81fb51898e92','Shades(Specs) for myself','EXPENSE','#EF4444','2026-05-24 11:23:59.013','2026-05-24 11:23:59.013',NULL,'cmpjcji0600006anvhatw5jlg'),('eb04b301-b9ef-45c4-b987-07506d3dae40','Gaming','EXPENSE','#EF4444','2026-05-24 11:23:58.918','2026-05-24 11:23:58.918',NULL,'cmpjcji0600006anvhatw5jlg'),('efdeca92-5c88-4210-b905-9fc21b05e8e7','Movie Ticket','EXPENSE','#EF4444','2026-05-24 11:23:58.943','2026-05-24 11:23:58.943',NULL,'cmpjcji0600006anvhatw5jlg'),('f8e68a0a-9677-419e-938a-a88c2d13bbea','FMB Thaali Niyat Amount ','EXPENSE','#EF4444','2026-05-24 11:23:59.016','2026-05-24 11:23:59.016',NULL,'cmpjcji0600006anvhatw5jlg');
/*!40000 ALTER TABLE `category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contact`
--

DROP TABLE IF EXISTS `contact`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contact` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `groupName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Family',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `Contact_userId_idx` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contact`
--

LOCK TABLES `contact` WRITE;
/*!40000 ALTER TABLE `contact` DISABLE KEYS */;
/*!40000 ALTER TABLE `contact` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `currency`
--

DROP TABLE IF EXISTS `currency`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `currency` (
  `code` varchar(5) COLLATE utf8mb4_unicode_ci NOT NULL,
  `symbol` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `currency`
--

LOCK TABLES `currency` WRITE;
/*!40000 ALTER TABLE `currency` DISABLE KEYS */;
INSERT INTO `currency` VALUES ('AED','د.إ','UAE Dirham'),('EUR','€','Euro'),('GBP','£','British Pound'),('INR','₹','Indian Rupee'),('USD','$','US Dollar');
/*!40000 ALTER TABLE `currency` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `excelmappingtemplate`
--

DROP TABLE IF EXISTS `excelmappingtemplate`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `excelmappingtemplate` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `target_table` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mapping_json` json NOT NULL,
  `validation_rules` json DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ExcelMappingTemplate_target_table_idx` (`target_table`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `excelmappingtemplate`
--

LOCK TABLES `excelmappingtemplate` WRITE;
/*!40000 ALTER TABLE `excelmappingtemplate` DISABLE KEYS */;
/*!40000 ALTER TABLE `excelmappingtemplate` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `expense`
--

DROP TABLE IF EXISTS `expense`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `expense` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `vendor` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `currency` varchar(3) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'USD',
  `transaction_date` datetime(3) NOT NULL,
  `payment_mode` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `recurring` tinyint(1) NOT NULL DEFAULT '0',
  `recurring_frequency` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `tags` json DEFAULT NULL,
  `metadata_json` json DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `Expense_category_id_idx` (`category_id`),
  KEY `Expense_user_id_idx` (`user_id`),
  KEY `Expense_transaction_date_idx` (`transaction_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `expense`
--

LOCK TABLES `expense` WRITE;
/*!40000 ALTER TABLE `expense` DISABLE KEYS */;
INSERT INTO `expense` VALUES ('063acb69-70b5-4e81-a115-ab5a262d1798','cmpjcji0600006anvhatw5jlg','68f0382f-4125-45ab-a5c2-490da3f04e69','Contribution Amount given to Husain Khanpurwala',900.00,'USD','2026-03-28 00:00:00.000',NULL,0,NULL,'Imported from Excel',NULL,NULL,'2026-05-24 11:23:59.029','2026-05-24 11:23:59.029',NULL),('08dd1ae7-41ba-422f-b8d3-a9c4f19a536e','cmpjcji0600006anvhatw5jlg','e3997957-4333-41ad-b993-9ee7992636d2','Contribution given to Husain Najmi for Gaming Zone',350.00,'USD','2025-10-28 00:00:00.000',NULL,0,NULL,'Imported from Excel',NULL,NULL,'2026-05-24 11:23:59.029','2026-05-24 11:23:59.029',NULL),('145f3852-fdda-401c-9b74-af1444269efc','cmpjcji0600006anvhatw5jlg','27d8098c-6ec0-4b4d-b080-aa3c6c56981a','Adnan Contribution for Mumbai Trip',422.65,'USD','2026-03-19 00:00:00.000',NULL,0,NULL,'Imported from Excel',NULL,NULL,'2026-05-24 11:23:59.029','2026-05-24 11:23:59.029',NULL),('1716b000-01e2-4a75-855f-333a36288a8a','cmpjcji0600006anvhatw5jlg','8ea1c40a-bb4f-4739-ac25-9ca7ade028f9','Contribution Amount given to Sahil Shaikh(A-103) for Dinner',125.00,'USD','2025-10-23 00:00:00.000',NULL,0,NULL,'Imported from Excel',NULL,NULL,'2026-05-24 11:23:59.029','2026-05-24 11:23:59.029',NULL),('19455ac0-9258-426d-93a4-547118519ee2','cmpjcji0600006anvhatw5jlg','19c25c00-a50d-46d6-b134-804a6596e2ed','Eid',500.00,'USD','2025-05-04 00:00:00.000',NULL,0,NULL,'Imported from Excel',NULL,NULL,'2026-05-24 11:23:59.029','2026-05-24 11:23:59.029',NULL),('1f3bd68d-05f4-4f35-b9d4-8bab16694d1b','cmpjcji0600006anvhatw5jlg','f8e68a0a-9677-419e-938a-a88c2d13bbea','FMB THAALI AMOUNT',5000.00,'USD','2026-05-18 00:00:00.000',NULL,0,NULL,'Imported from Excel',NULL,NULL,'2026-05-24 11:23:59.029','2026-05-24 11:23:59.029',NULL),('29a6728d-3139-4b46-a4c7-bfca872270e5','cmpjcji0600006anvhatw5jlg','b286bad0-1b9e-4a99-b4a0-1cd63b14e4bb','To  Taher Kanorewala for Lunch Contribution',277.00,'USD','2025-07-08 00:00:00.000',NULL,0,NULL,'Imported from Excel',NULL,NULL,'2026-05-24 11:23:59.029','2026-05-24 11:23:59.029',NULL),('2abc8e7d-4c39-42e9-9d89-e8ad04aa229f','cmpjcji0600006anvhatw5jlg','d15b630d-243e-4b38-b646-a39b9d246ebc','Contribution Amount given to Juzer Akodiyawala for the gift',200.00,'USD','2025-08-31 00:00:00.000',NULL,0,NULL,'Imported from Excel',NULL,NULL,'2026-05-24 11:23:59.029','2026-05-24 11:23:59.029',NULL),('2f475531-bafc-477a-8b89-61f29a634da5','cmpjcji0600006anvhatw5jlg','5aa6b698-7a01-41cc-ac43-a9266bd92a49','Contribution given to Husain Najmi',783.00,'USD','2026-04-20 00:00:00.000',NULL,0,NULL,'Imported from Excel',NULL,NULL,'2026-05-24 11:23:59.029','2026-05-24 11:23:59.029',NULL),('3ec352f2-6bcf-4c30-84bd-db17d180208f','cmpjcji0600006anvhatw5jlg','b0822292-a9e2-45e8-9ba4-62a47f46b3c0','Contribution for Coffee Unit',500.00,'USD','2026-03-06 00:00:00.000',NULL,0,NULL,'Imported from Excel',NULL,NULL,'2026-05-24 11:23:59.029','2026-05-24 11:23:59.029',NULL),('412650fe-9dcb-430e-8584-d21b993068fd','cmpjcji0600006anvhatw5jlg','0104ffd9-59ed-4e36-b299-2a40049ba643','Given Amount to Ammar Lokhandwala for Sundary Get Together',300.00,'USD','2025-09-03 00:00:00.000',NULL,0,NULL,'Imported from Excel',NULL,NULL,'2026-05-24 11:23:59.029','2026-05-24 11:23:59.029',NULL),('4a9910cf-5acf-478f-9294-873b52bc80d3','cmpjcji0600006anvhatw5jlg','7c8ee11f-eab2-4f2c-9fd6-e1698c1cfb64','Astar Topi For my self',575.00,'USD','2026-04-10 00:00:00.000',NULL,0,NULL,'Imported from Excel',NULL,NULL,'2026-05-24 11:23:59.029','2026-05-24 11:23:59.029',NULL),('557e59f3-586d-4061-a029-02633af8b79f','cmpjcji0600006anvhatw5jlg','94fee142-bf4b-42d4-96d1-f213bf38ea92','Eidi for my Ammi',500.00,'USD','2026-03-21 00:00:00.000',NULL,0,NULL,'Imported from Excel',NULL,NULL,'2026-05-24 11:23:59.029','2026-05-24 11:23:59.029',NULL),('5a1e8c67-835c-413b-ba41-06486dd72cee','cmpjcji0600006anvhatw5jlg','c9d55099-bf3c-48ac-b2fb-246da1977d07','Shehrullah Silat 1447H',553.00,'USD','2026-03-03 00:00:00.000',NULL,0,NULL,'Imported from Excel',NULL,NULL,'2026-05-24 11:23:59.029','2026-05-24 11:23:59.029',NULL),('5fe5e0ea-4ebf-4d1e-8a91-40cee5702fd9','cmpjcji0600006anvhatw5jlg','b286bad0-1b9e-4a99-b4a0-1cd63b14e4bb','To  Taher Kanorewala for Lunch Contribution',140.00,'USD','2025-06-16 00:00:00.000',NULL,0,NULL,'Imported from Excel',NULL,NULL,'2026-05-24 11:23:59.029','2026-05-24 11:23:59.029',NULL),('61486e72-253a-4155-b630-0c0fa2111c8e','cmpjcji0600006anvhatw5jlg','d8cd0f75-5cbd-4943-9154-0ddd475f4c0b','Paid to Adnan For TKM lawazim 1447H till Shawwal',1000.00,'USD','2026-04-09 00:00:00.000',NULL,0,NULL,'Imported from Excel',NULL,NULL,'2026-05-24 11:23:59.029','2026-05-24 11:23:59.029',NULL),('6205204b-8824-404a-ad91-ba3b22bfa5b5','cmpjcji0600006anvhatw5jlg','8c53f3a2-47ef-4453-a6d7-45096be1a3c7','Dinner Contri to Farid',565.00,'USD','2026-03-28 00:00:00.000',NULL,0,NULL,'Imported from Excel',NULL,NULL,'2026-05-24 11:23:59.029','2026-05-24 11:23:59.029',NULL),('64235f8d-b91d-45d8-b758-e4ceb2f612b2','cmpjcji0600006anvhatw5jlg','ae57f15d-6824-4f73-a17a-ae9f0842860f','My Kurta Saya Sets 2',2100.00,'USD','2025-06-16 00:00:00.000',NULL,0,NULL,'Imported from Excel',NULL,NULL,'2026-05-24 11:23:59.029','2026-05-24 11:23:59.029',NULL),('6548b3bc-8adb-4d1e-86ca-b69d45008cc4','cmpjcji0600006anvhatw5jlg','0e7f81a0-8b71-4c13-a6b8-900364b59fc7','Mannat and Thaal',1950.00,'USD','2025-11-23 00:00:00.000',NULL,0,NULL,'Imported from Excel',NULL,NULL,'2026-05-24 11:23:59.029','2026-05-24 11:23:59.029',NULL),('67f3d386-cfdc-4068-bb0f-e1ab46f46bc7','cmpjcji0600006anvhatw5jlg','23b4dba3-625d-4379-bd39-426f118f1aa6','Contribution for TKM Event Darees',1000.00,'USD','2025-09-04 00:00:00.000',NULL,0,NULL,'Imported from Excel',NULL,NULL,'2026-05-24 11:23:59.029','2026-05-24 11:23:59.029',NULL),('6fb07a36-58a8-4795-b5ca-10569e23527e','cmpjcji0600006anvhatw5jlg','636bcc13-ba99-4211-90c9-10c9ac188ea2','Amount Spent on Ring and Bracelet',2430.00,'USD','2026-05-18 00:00:00.000',NULL,0,NULL,'Imported from Excel',NULL,NULL,'2026-05-24 11:23:59.029','2026-05-24 11:23:59.029',NULL),('76a52fe1-ee9d-4262-866d-9ae96d4bd847','cmpjcji0600006anvhatw5jlg','7138a6e9-18e3-4182-8f48-637ea945da15','Ammar Contribution for Mumbai Trip',522.04,'USD','2026-03-19 00:00:00.000',NULL,0,NULL,'Imported from Excel',NULL,NULL,'2026-05-24 11:23:59.029','2026-05-24 11:23:59.029',NULL),('76ce23c7-41c2-4ea6-b8a6-42ac705ec61a','cmpjcji0600006anvhatw5jlg','94ba41cf-b017-4317-9d22-0e330214ae5e','Toloba BBQ Contri',1000.00,'USD','2025-05-04 00:00:00.000',NULL,0,NULL,'Imported from Excel',NULL,NULL,'2026-05-24 11:23:59.029','2026-05-24 11:23:59.029',NULL),('7d4264de-a326-4f09-a69b-5919985720a3','cmpjcji0600006anvhatw5jlg','4bc3504c-5f19-4048-bdd7-fe7410cb1cd9','Mithai For My First Salary',246.00,'USD','2025-05-04 00:00:00.000',NULL,0,NULL,'Imported from Excel',NULL,NULL,'2026-05-24 11:23:59.029','2026-05-24 11:23:59.029',NULL),('83a96086-9a44-46e2-9090-ceac224bdf71','cmpjcji0600006anvhatw5jlg','5306177f-6c6d-41d0-be97-144e064710d7','Savings Amount give to Ammi',1000.00,'USD','2025-09-02 00:00:00.000',NULL,0,NULL,'Imported from Excel',NULL,NULL,'2026-05-24 11:23:59.029','2026-05-24 11:23:59.029',NULL),('83ddff86-e324-420c-ae27-98bfb7fb6488','cmpjcji0600006anvhatw5jlg','60279099-6cc6-4147-b1de-b42147f57f85','Contribution Amount given to Ammar Lokhandawala',500.00,'USD','2026-01-18 00:00:00.000',NULL,0,NULL,'Imported from Excel',NULL,NULL,'2026-05-24 11:23:59.029','2026-05-24 11:23:59.029',NULL),('8b85fe3a-bf36-4f10-bec4-722998e6af69','cmpjcji0600006anvhatw5jlg','61484de2-5914-40ed-a8ab-95e049ee0eed','Rida Amount from my Salary',1400.00,'USD','2025-09-02 00:00:00.000',NULL,0,NULL,'Imported from Excel',NULL,NULL,'2026-05-24 11:23:59.029','2026-05-24 11:23:59.029',NULL),('924ed974-6657-48b4-9e80-2352d9a405a4','cmpjcji0600006anvhatw5jlg','153d845a-4078-4286-b041-eb8e23242019','(Ammi niyat(500) and Mustafa Niyat(500) for salary)',1000.00,'USD','2025-05-01 00:00:00.000',NULL,0,NULL,'Imported from Excel',NULL,NULL,'2026-05-24 11:23:59.029','2026-05-24 11:23:59.029',NULL),('945ba512-4582-46c7-9227-0bc954374d06','cmpjcji0600006anvhatw5jlg','147322bb-4d9a-4cde-9cb7-dcf90db1ec23','Contribution for Fruit Party for Janab, Zakereen',400.00,'USD','2026-03-04 00:00:00.000',NULL,0,NULL,'Imported from Excel',NULL,NULL,'2026-05-24 11:23:59.029','2026-05-24 11:23:59.029',NULL),('950df279-bd58-456b-b28c-fbf7f01b09f6','cmpjcji0600006anvhatw5jlg','efdeca92-5c88-4210-b905-9fc21b05e8e7','Demon Slayer Movie Ticket',360.00,'USD','2025-09-14 00:00:00.000',NULL,0,NULL,'Imported from Excel',NULL,NULL,'2026-05-24 11:23:59.029','2026-05-24 11:23:59.029',NULL),('9c43dc86-6f9c-4cc0-b6f5-9bc1c3759f27','cmpjcji0600006anvhatw5jlg','21a22cee-9080-4578-8c2a-da3dd1aaf717','Niyaaz-e-Husain Chennai Ashara 1447H',5300.00,'USD','2025-06-30 00:00:00.000',NULL,0,NULL,'Imported from Excel',NULL,NULL,'2026-05-24 11:23:59.029','2026-05-24 11:23:59.029',NULL),('9fdb0ce0-c1e9-4fde-ae41-aab7de29c451','cmpjcji0600006anvhatw5jlg','784c178d-c41d-4544-81eb-58e4f9e95d2d','Vajebaat Takhmeen 1447H',5300.00,'USD','2026-02-23 00:00:00.000',NULL,0,NULL,'Imported from Excel',NULL,NULL,'2026-05-24 11:23:59.029','2026-05-24 11:23:59.029',NULL),('a24193ab-06c3-4c9a-b7d0-ae1bd32bddb0','cmpjcji0600006anvhatw5jlg','6259fc9a-ef05-4c58-b9eb-e7797c21470d','Contribution Amount to husain',71.43,'USD','2026-04-01 00:00:00.000',NULL,0,NULL,'Imported from Excel',NULL,NULL,'2026-05-24 11:23:59.029','2026-05-24 11:23:59.029',NULL),('b6df2874-4aed-4ede-af15-2c121d5a3c99','cmpjcji0600006anvhatw5jlg','e649bbe6-76ce-48f0-8618-4583c745dc45','Lawazim for Toloba',3300.00,'USD','2025-08-04 00:00:00.000',NULL,0,NULL,'Imported from Excel',NULL,NULL,'2026-05-24 11:23:59.029','2026-05-24 11:23:59.029',NULL),('b9feb7a5-ca19-4322-9946-b011044bbf2a','cmpjcji0600006anvhatw5jlg','d6865c1b-d21b-40fa-b3e7-f1f2b4a23e61','Dawat-e-Hadiyah Amount',400.00,'USD','2025-10-20 00:00:00.000',NULL,0,NULL,'Imported from Excel',NULL,NULL,'2026-05-24 11:23:59.029','2026-05-24 11:23:59.029',NULL),('c03367ae-4699-4d2a-aa72-e6ef0086dfe9','cmpjcji0600006anvhatw5jlg','ab702366-701c-41c6-ab9c-08dff913a9d2','Shehrullah Silat 1447H',553.00,'USD','2026-03-03 00:00:00.000',NULL,0,NULL,'Imported from Excel',NULL,NULL,'2026-05-24 11:23:59.029','2026-05-24 11:23:59.029',NULL),('da7ab851-191a-4f3f-b0f0-a2864b851140','cmpjcji0600006anvhatw5jlg','d05eb8a5-b703-4431-8c53-dbe7e73c15dc','Amount Return To Ammi',1000.00,'USD','2025-12-13 00:00:00.000',NULL,0,NULL,'Imported from Excel',NULL,NULL,'2026-05-24 11:23:59.029','2026-05-24 11:23:59.029',NULL),('dbe4df1e-0f46-40f1-b025-eefab8c043f9','cmpjcji0600006anvhatw5jlg','0e7f81a0-8b71-4c13-a6b8-900364b59fc7','Mannat and Thaal',6400.00,'USD','2025-09-22 00:00:00.000',NULL,0,NULL,'Imported from Excel',NULL,NULL,'2026-05-24 11:23:59.029','2026-05-24 11:23:59.029',NULL),('de858810-8394-47d4-afe5-95e58b8e2d1d','cmpjcji0600006anvhatw5jlg','72132a4e-92e1-480e-9173-343bc310bc74','Personal Expense',500.00,'USD','2025-05-04 00:00:00.000',NULL,0,NULL,'Imported from Excel',NULL,NULL,'2026-05-24 11:23:59.029','2026-05-24 11:23:59.029',NULL),('e76a3123-1c24-48e6-8dce-e207fd228601','cmpjcji0600006anvhatw5jlg','6ca6d2af-f65a-47b1-ac04-40dba5a5123a','Self Clothes Amount',6102.00,'USD','2025-10-11 00:00:00.000',NULL,0,NULL,'Imported from Excel',NULL,NULL,'2026-05-24 11:23:59.029','2026-05-24 11:23:59.029',NULL),('ea8c5da5-e643-46bc-b21c-335e15fced24','cmpjcji0600006anvhatw5jlg','6ca6d2af-f65a-47b1-ac04-40dba5a5123a','Self Clothes Amount',4718.00,'USD','2026-04-25 00:00:00.000',NULL,0,NULL,'Imported from Excel',NULL,NULL,'2026-05-24 11:23:59.029','2026-05-24 11:23:59.029',NULL),('efe83909-a208-4da5-b9da-1c28ed18dd22','cmpjcji0600006anvhatw5jlg','8ea1c40a-bb4f-4739-ac25-9ca7ade028f9','Contribution amount given to Aminul Nadaf for dinner',280.00,'USD','2025-10-08 00:00:00.000',NULL,0,NULL,'Imported from Excel',NULL,NULL,'2026-05-24 11:23:59.029','2026-05-24 11:23:59.029',NULL),('f2b1c52c-510f-490b-bb12-d1f2e74dc91d','cmpjcji0600006anvhatw5jlg','7fab31ae-55f0-410e-8c12-e4a34fbce084','Zakereen Niyaaz Amount',250.00,'USD','2025-06-12 00:00:00.000',NULL,0,NULL,'Imported from Excel',NULL,NULL,'2026-05-24 11:23:59.029','2026-05-24 11:23:59.029',NULL),('f5bd305f-4537-4e5d-8a2f-08adbab5c71c','cmpjcji0600006anvhatw5jlg','b3053ad9-ba4a-4408-980a-38256d13a4c4','Mumbai Trip Breakfast Eid',615.00,'USD','2026-03-19 00:00:00.000',NULL,0,NULL,'Imported from Excel',NULL,NULL,'2026-05-24 11:23:59.029','2026-05-24 11:23:59.029',NULL),('fa8fb6e4-2329-4285-a115-641959f4bdb7','cmpjcji0600006anvhatw5jlg','ab702366-701c-41c6-ab9c-08dff913a9d2','Salaam from First Salary',1000.00,'USD','2025-05-01 00:00:00.000',NULL,0,NULL,'Imported from Excel',NULL,NULL,'2026-05-24 11:23:59.029','2026-05-24 11:23:59.029',NULL),('fde2d619-7fc1-40cf-9e48-aceed650bce7','cmpjcji0600006anvhatw5jlg','ea8d9614-68c7-47e0-9679-81fb51898e92','Sunglass For me',650.00,'USD','2026-05-09 00:00:00.000',NULL,0,NULL,'Imported from Excel',NULL,NULL,'2026-05-24 11:23:59.029','2026-05-24 11:23:59.029',NULL),('fdee92cc-562d-4324-b4f0-af2d75d6e5f6','cmpjcji0600006anvhatw5jlg','eb04b301-b9ef-45c4-b987-07506d3dae40','Paid for Gaming Zone with Husain and Ammar',1050.00,'USD','2025-08-03 00:00:00.000',NULL,0,NULL,'Imported from Excel',NULL,NULL,'2026-05-24 11:23:59.029','2026-05-24 11:23:59.029',NULL);
/*!40000 ALTER TABLE `expense` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `income`
--

DROP TABLE IF EXISTS `income`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `income` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `source` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `currency` varchar(3) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'USD',
  `transaction_date` datetime(3) NOT NULL,
  `payment_mode` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `recurring` tinyint(1) NOT NULL DEFAULT '0',
  `recurring_frequency` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `tags` json DEFAULT NULL,
  `metadata_json` json DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `Income_category_id_idx` (`category_id`),
  KEY `Income_user_id_idx` (`user_id`),
  KEY `Income_transaction_date_idx` (`transaction_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `income`
--

LOCK TABLES `income` WRITE;
/*!40000 ALTER TABLE `income` DISABLE KEYS */;
INSERT INTO `income` VALUES ('0fc94388-01c3-4af2-8460-8ff50daed698','cmpjcji0600006anvhatw5jlg','774837e7-aba9-4b07-bd18-09c0c1558dda','Salary from Elite Infosoft',7000.00,'USD','2025-05-31 00:00:00.000',NULL,0,NULL,'Imported from Excel',NULL,NULL,'2026-05-24 11:23:59.023','2026-05-24 11:23:59.023',NULL),('2295c5c5-52b7-45a2-bfa0-7d56d567c88c','cmpjcji0600006anvhatw5jlg','774837e7-aba9-4b07-bd18-09c0c1558dda','Salary from Elite Infosoft',11800.00,'USD','2025-10-31 00:00:00.000',NULL,0,NULL,'Imported from Excel',NULL,NULL,'2026-05-24 11:23:59.023','2026-05-24 11:23:59.023',NULL),('2ed86ada-52ae-40b0-89c0-072ec8787b03','cmpjcji0600006anvhatw5jlg','774837e7-aba9-4b07-bd18-09c0c1558dda','Salary from Elite Infosoft',8250.00,'USD','2025-09-30 00:00:00.000',NULL,0,NULL,'Imported from Excel',NULL,NULL,'2026-05-24 11:23:59.023','2026-05-24 11:23:59.023',NULL),('57dd63ea-d67e-459c-b13a-f2d008ab6783','cmpjcji0600006anvhatw5jlg','774837e7-aba9-4b07-bd18-09c0c1558dda','Salary from Elite Infosoft',13600.00,'USD','2026-04-30 00:00:00.000',NULL,0,NULL,'Imported from Excel',NULL,NULL,'2026-05-24 11:23:59.023','2026-05-24 11:23:59.023',NULL),('79efa153-a87b-4c57-9fbd-1adadb1f66f4','cmpjcji0600006anvhatw5jlg','774837e7-aba9-4b07-bd18-09c0c1558dda','Salary from Elite Infosoft',11000.00,'USD','2026-01-01 00:00:00.000',NULL,0,NULL,'Imported from Excel',NULL,NULL,'2026-05-24 11:23:59.023','2026-05-24 11:23:59.023',NULL),('7f2bd0f5-9aae-4d90-bd22-594cac691e5e','cmpjcji0600006anvhatw5jlg','774837e7-aba9-4b07-bd18-09c0c1558dda','Salary from Elite Infosoft',4667.00,'USD','2025-08-02 00:00:00.000',NULL,0,NULL,'Imported from Excel',NULL,NULL,'2026-05-24 11:23:59.023','2026-05-24 11:23:59.023',NULL),('808955e8-8077-4c26-8a5e-7371ed79c00e','cmpjcji0600006anvhatw5jlg','774837e7-aba9-4b07-bd18-09c0c1558dda','Salary from Elite Infosoft',11400.00,'USD','2025-12-01 00:00:00.000',NULL,0,NULL,'Imported from Excel',NULL,NULL,'2026-05-24 11:23:59.023','2026-05-24 11:23:59.023',NULL),('989f18b9-df92-472b-b791-f93b6ea27010','cmpjcji0600006anvhatw5jlg','774837e7-aba9-4b07-bd18-09c0c1558dda','Salary from Elite Infosoft',11700.00,'USD','2026-02-28 00:00:00.000',NULL,0,NULL,'Imported from Excel',NULL,NULL,'2026-05-24 11:23:59.023','2026-05-24 11:23:59.023',NULL),('a186adb5-24d4-4622-bfae-2022e3056430','cmpjcji0600006anvhatw5jlg','774837e7-aba9-4b07-bd18-09c0c1558dda','Salary from Elite Infosoft',6067.00,'USD','2025-09-01 00:00:00.000',NULL,0,NULL,'Imported from Excel',NULL,NULL,'2026-05-24 11:23:59.023','2026-05-24 11:23:59.023',NULL),('b42a267f-c9e5-4460-b3e4-82b5b6255ecf','cmpjcji0600006anvhatw5jlg','774837e7-aba9-4b07-bd18-09c0c1558dda','Salary from Elite Infosoft',3500.00,'USD','2025-05-01 00:00:00.000',NULL,0,NULL,'Imported from Excel',NULL,NULL,'2026-05-24 11:23:59.023','2026-05-24 11:23:59.023',NULL),('b84232a6-26ae-4c1d-be40-0c58147eeb42','cmpjcji0600006anvhatw5jlg','774837e7-aba9-4b07-bd18-09c0c1558dda','Salary from Elite Infosoft',11800.00,'USD','2026-01-30 00:00:00.000',NULL,0,NULL,'Imported from Excel',NULL,NULL,'2026-05-24 11:23:59.023','2026-05-24 11:23:59.023',NULL),('cfe2e675-e7c2-4b31-a950-81a8162c9f38','cmpjcji0600006anvhatw5jlg','774837e7-aba9-4b07-bd18-09c0c1558dda','Salary from Elite Infosoft',6100.00,'USD','2025-07-02 00:00:00.000',NULL,0,NULL,'Imported from Excel',NULL,NULL,'2026-05-24 11:23:59.023','2026-05-24 11:23:59.023',NULL),('dc2f0aad-d175-4da5-9106-4652758820ac','cmpjcr43n0000v2b4gwzebjf2','774837e7-aba9-4b07-bd18-09c0c1558dda','from elite',4500.00,'INR','2026-07-11 00:00:00.000',NULL,0,NULL,'salary test',NULL,NULL,'2026-07-11 14:14:32.699','2026-07-11 14:14:32.699',NULL),('e316dcbc-6dff-4808-a034-6e95bc559471','cmpjcji0600006anvhatw5jlg','774837e7-aba9-4b07-bd18-09c0c1558dda','Salary from Elite Infosoft',11000.00,'USD','2026-04-02 00:00:00.000',NULL,0,NULL,'Imported from Excel',NULL,NULL,'2026-05-24 11:23:59.023','2026-05-24 11:23:59.023',NULL);
/*!40000 ALTER TABLE `income` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `internalemail`
--

DROP TABLE IF EXISTS `internalemail`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `internalemail` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `senderId` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `senderEmail` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `recipientId` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `recipientEmail` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `body` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `read` tinyint(1) NOT NULL DEFAULT '0',
  `category` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PRIMARY',
  `system` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `InternalEmail_senderId_idx` (`senderId`),
  KEY `InternalEmail_recipientId_idx` (`recipientId`),
  KEY `InternalEmail_createdAt_idx` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `internalemail`
--

LOCK TABLES `internalemail` WRITE;
/*!40000 ALTER TABLE `internalemail` DISABLE KEYS */;
INSERT INTO `internalemail` VALUES ('220483a6-8a0d-402a-b517-a99638a64a5b',NULL,'security@finance.local','cmpjcji0600006anvhatw5jlg','mustafa@gmail.com','ALERT: Password Reset Verification Request','<div style=\"font-family: sans-serif; padding: 20px; color: #334155;\">\n          <h2 style=\"color: #e11d48; margin-bottom: 16px;\">Security Authorization Alert</h2>\n          <p><strong>Master Admin</strong> (admin@finance.local) is locked out and has requested password reset assistance.</p>\n          <p>If you recognize this request, please log in and approve it in <strong>System Settings</strong> to allow them to reset their password.</p>\n        </div>',1,'PRIMARY',1,'2026-07-11 11:16:02.438'),('2894325c-a1cc-46ba-8a2a-39691ea72e64',NULL,'security@finance.local','cmpjcr43n0000v2b4gwzebjf2','admin@finance.local','Password Reset Verification Code','<div style=\"font-family: sans-serif; padding: 20px; color: #334155;\">\n        <h2 style=\"color: #0f172a; margin-bottom: 16px;\">Password Reset Request</h2>\n        <p>A password reset has been requested for your account. Please use the following One-Time Password (OTP) to proceed:</p>\n        <div style=\"background-color: #f1f5f9; padding: 16px; border-radius: 8px; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 4px; margin: 24px 0; color: #2563eb;\">\n          325434\n        </div>\n        <p style=\"font-size: 13px; color: #64748b;\">This OTP code is valid for 5 minutes. If you did not make this request, please change your Transaction PIN immediately.</p>\n      </div>',0,'PRIMARY',1,'2026-07-11 11:21:08.802'),('4214525e-dd70-46cd-8380-ef06048a4813',NULL,'system@finance.local','cmpjcr43n0000v2b4gwzebjf2','admin@finance.local','Reset Your Transaction PIN','<div style=\"font-family: \'Outfit\', sans-serif; padding: 24px; max-width: 500px; margin: auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);\">\n        <h2 style=\"color: #0f172a; margin-top: 0; margin-bottom: 8px; font-size: 20px; font-weight: 700; text-align: center;\">Transaction PIN Reset</h2>\n        <p style=\"color: #475569; font-size: 14px; line-height: 1.5; text-align: center; margin-bottom: 24px;\">You requested to reset your transaction security PIN for the Finance Admin Platform.</p>\n        \n        <div style=\"text-align: center; margin-bottom: 24px;\">\n          <a href=\"http://localhost:3000/settings/reset-pin?token=3f0f33c368cef032c7ee41978f73ce5fde512a5fae19da0e2cdccd9e129e07f6\" target=\"_top\" style=\"display: inline-block; background-color: #0f172a; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600; transition: background-color 0.2s;\">Reset Secure PIN</a>\n        </div>\n        \n        <p style=\"color: #64748b; font-size: 11px; text-align: center; margin-top: 24px; border-t: 1px solid #f1f5f9; padding-top: 16px;\">\n          This link will expire in 1 hour. If you did not request this update, please review your account activity.\n        </p>\n      </div>',1,'PRIMARY',1,'2026-07-11 10:41:19.640'),('f3b44e19-8260-41f9-996d-dc5191577bf7',NULL,'system@finance.local','cmpjcji0600006anvhatw5jlg','mustafa@gmail.com','Configure Your Transaction PIN','<div style=\"font-family: \'Outfit\', sans-serif; padding: 24px; max-width: 500px; margin: auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);\">\n        <h2 style=\"color: #0f172a; margin-top: 0; margin-bottom: 8px; font-size: 20px; font-weight: 700; text-align: center;\">Transaction PIN Configure</h2>\n        <p style=\"color: #475569; font-size: 14px; line-height: 1.5; text-align: center; margin-bottom: 24px;\">You requested to configure your transaction security PIN for the Finance Admin Platform.</p>\n        \n        <div style=\"text-align: center; margin-bottom: 24px;\">\n          <a href=\"http://localhost:3000/settings/reset-pin?token=06203eedac5739f9299fdcdf2804440c232848c591b1afb8fb105d379fde2c17\" target=\"_top\" style=\"display: inline-block; background-color: #0f172a; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600; transition: background-color 0.2s;\">Configure Secure PIN</a>\n        </div>\n        \n        <p style=\"color: #64748b; font-size: 11px; text-align: center; margin-top: 24px; border-t: 1px solid #f1f5f9; padding-top: 16px;\">\n          This link will expire in 1 hour. If you did not request this update, please review your account activity.\n        </p>\n      </div>',1,'PRIMARY',1,'2026-07-11 14:15:55.734'),('fbd3ebb8-9f95-425f-b1d5-995a3d650124',NULL,'system@finance.local','cmpjcr43n0000v2b4gwzebjf2','admin@finance.local','Configure Your Transaction PIN','<div style=\"font-family: \'Outfit\', sans-serif; padding: 24px; max-width: 500px; margin: auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);\">\n        <h2 style=\"color: #0f172a; margin-top: 0; margin-bottom: 8px; font-size: 20px; font-weight: 700; text-align: center;\">Transaction PIN Configuration</h2>\n        <p style=\"color: #475569; font-size: 14px; line-height: 1.5; text-align: center; margin-bottom: 24px;\">You requested to set or reset your transaction security PIN for the Finance Admin Platform.</p>\n        \n        <div style=\"text-align: center; margin-bottom: 24px;\">\n          <a href=\"http://localhost:3000/settings/reset-pin?token=45f614a9c6dfd493f9b8acbf7d7f19fb080c7d51bf78925ac94525fe3f6fbe2a\" style=\"display: inline-block; background-color: #0f172a; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600; transition: background-color 0.2s;\">Configure Secure PIN</a>\n        </div>\n        \n        <p style=\"color: #64748b; font-size: 11px; text-align: center; margin-top: 24px; border-t: 1px solid #f1f5f9; padding-top: 16px;\">\n          This link will expire in 1 hour. If you did not request this update, please review your account activity.\n        </p>\n      </div>',1,'PRIMARY',1,'2026-07-11 10:35:03.106');
/*!40000 ALTER TABLE `internalemail` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rolepermission`
--

DROP TABLE IF EXISTS `rolepermission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rolepermission` (
  `role` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `canViewDashboard` tinyint(1) NOT NULL DEFAULT '1',
  `canViewIncome` tinyint(1) NOT NULL DEFAULT '1',
  `canCreateIncome` tinyint(1) NOT NULL DEFAULT '1',
  `canUpdateIncome` tinyint(1) NOT NULL DEFAULT '1',
  `canDeleteIncome` tinyint(1) NOT NULL DEFAULT '1',
  `canViewExpense` tinyint(1) NOT NULL DEFAULT '1',
  `canCreateExpense` tinyint(1) NOT NULL DEFAULT '1',
  `canUpdateExpense` tinyint(1) NOT NULL DEFAULT '1',
  `canDeleteExpense` tinyint(1) NOT NULL DEFAULT '1',
  `canViewImports` tinyint(1) NOT NULL DEFAULT '1',
  `canImportExcel` tinyint(1) NOT NULL DEFAULT '1',
  `canTruncateDatabase` tinyint(1) NOT NULL DEFAULT '0',
  `canViewInbox` tinyint(1) NOT NULL DEFAULT '1',
  `canComposeEmail` tinyint(1) NOT NULL DEFAULT '1',
  `canViewSettings` tinyint(1) NOT NULL DEFAULT '1',
  `canManageContacts` tinyint(1) NOT NULL DEFAULT '1',
  `canManagePermissions` tinyint(1) NOT NULL DEFAULT '0',
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rolepermission`
--

LOCK TABLES `rolepermission` WRITE;
/*!40000 ALTER TABLE `rolepermission` DISABLE KEYS */;
INSERT INTO `rolepermission` VALUES ('MEMBER',1,1,1,1,0,1,1,1,0,0,0,0,1,1,1,1,0,'2026-07-11 13:52:39.461'),('SUPERADMIN',1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,'2026-07-11 13:46:38.305'),('USER',1,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,'2026-07-11 13:52:39.469');
/*!40000 ALTER TABLE `rolepermission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transfer`
--

DROP TABLE IF EXISTS `transfer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transfer` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `senderId` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `senderEmail` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `recipientId` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `recipientEmail` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `Transfer_senderId_idx` (`senderId`),
  KEY `Transfer_recipientId_idx` (`recipientId`),
  KEY `Transfer_createdAt_idx` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transfer`
--

LOCK TABLES `transfer` WRITE;
/*!40000 ALTER TABLE `transfer` DISABLE KEYS */;
/*!40000 ALTER TABLE `transfer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'USER',
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `currencyCode` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'USD',
  `pinResetExpires` datetime(3) DEFAULT NULL,
  `pinResetToken` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `transactionPin` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `familyHelpApproved` tinyint(1) NOT NULL DEFAULT '0',
  `familyHelpRequestedAt` datetime(3) DEFAULT NULL,
  `passwordResetOtp` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `passwordResetOtpExpires` datetime(3) DEFAULT NULL,
  `isMasterAdmin` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES ('cmpjcji0600006anvhatw5jlg','Mustafa Chhabrawala','mustafa@gmail.com','password','SUPERADMIN','ACTIVE','2026-05-24 05:38:11.047','2026-07-11 14:23:00.037','INR',NULL,NULL,'$2b$10$LZBq6qtIfpiZQZVKxrcJfuchemeU0PbyNnZSpQo8sDfBm/ck27UBS',0,NULL,NULL,NULL,0),('cmpjcr43n0000v2b4gwzebjf2','Master Admin','admin@finance.local','admin','SUPERADMIN','ACTIVE','2026-05-24 05:44:06.275','2026-07-11 11:25:23.006','INR',NULL,NULL,'$2b$10$m88uay0I3DoeMlm4qU5lTezV6lKgbzrpfF/R5inn/hINOLYUwd9J6',0,NULL,NULL,NULL,1);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-11 21:23:59
