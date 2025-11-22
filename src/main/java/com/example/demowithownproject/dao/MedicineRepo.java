package com.example.demowithownproject.dao;


import org.springframework.data.jpa.repository.JpaRepository;
import com.example.demowithownproject.model.Medicine;

import java.time.LocalDate;
import java.util.List;

public interface MedicineRepo extends JpaRepository<Medicine, Long> {

    List<Medicine> findByDate(LocalDate date);
}
