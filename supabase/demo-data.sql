-- Facultatif : quelques annonces de démonstration (vendeurs fictifs)
-- À exécuter après schema.sql. Supprime-les avant le vrai lancement :
--   delete from public.annonces where owner is null;
insert into public.annonces (nom, cat, compat, ref, etat, prix, qte, vendeur, type, commune, ile, tel, statut) values
 ('Plaquettes de frein avant','voiture','Toyota Hilux 2015-2023','04465-0K290','neuf',6900,7,'Auto Pièces Fare Ute (démo)','pro','Papeete','Tahiti','87000001','publie'),
 ('Filtre à gasoil','camion','Isuzu NPR / NQR','8-98037-011','neuf',3200,12,'Moana Poids Lourds (démo)','pro','Punaauia','Tahiti','87000004','publie'),
 ('Dent de godet','drague','Pelles 20 t','1U3352','neuf',9500,24,'Fenua TP Équipements (démo)','pro','Papeete','Tahiti','87000005','publie'),
 ('Filtre à huile moteur','case','Case 580 SN / 590','84475542','neuf',4800,9,'Fenua TP Équipements (démo)','pro','Papeete','Tahiti','87000005','publie'),
 ('Courroie de transmission','scooter','Vespa Primavera 125','1A000387','neuf',5600,3,'Moto Center Arue (démo)','pro','Arue','Tahiti','87000007','publie'),
 ('Batterie 48 V 13 Ah','velo','Vélos électriques cadre bas','','neuf',42000,2,'E-Bike Tahiti (démo)','pro','Pirae','Tahiti','87000009','publie'),
 ('Pompe à eau (turbine)','bateau','Yamaha F40 / F50','63D-44352-01','neuf',16900,3,'Nautisme Fenua (démo)','pro','Uturoa','Raiatea','87000010','publie'),
 ('Turbine de jet','jetski','Sea-Doo GTI 130','267000617','neuf',39000,1,'Marine Shop Taravao (démo)','pro','Taravao','Tahiti','87000011','publie');
