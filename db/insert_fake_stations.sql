USE projectdb;

INSERT INTO stations (project_id, station_name, machine_number, device_id, ip_address, idx) VALUES
(1, 'F0.5', 'M001', 'DUT-001', '192.168.0.101',''),
(1, 'F0.5', 'M002', 'DUT-002', '192.168.0.102',''),
(2, 'HDMI-T1', 'M010', 'HDMI-01', '192.168.1.11',''),
(3, 'AUDIO-T1', 'M020', 'MIC-01', '192.168.2.21',''),
(3, 'AUDIO-T2', 'M021', 'MIC-02', '192.168.2.22',''),
(4, 'FULL-TEST', 'M030', 'ZB-001', '192.168.3.31',''),
(5, 'TEMP-CHECK-1', 'M040', 'TMP-01', '192.168.4.41',''),
(6, 'TEMP-CHECK-2', 'M041', 'TMP-02', '192.168.4.42','');