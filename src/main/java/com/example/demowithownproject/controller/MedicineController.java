package com.example.demowithownproject.controller;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.example.demowithownproject.model.Medicine;
import com.example.demowithownproject.dao.MedicineRepo;

@RestController
@RequestMapping("/api/medicines")
@CrossOrigin(origins = "http://localhost:5173") 
public class MedicineController {

    @Autowired
    private MedicineRepo medicineRepo;

    @GetMapping
    public List<Medicine> getMedicines(@RequestParam(required = false) String date) {
        if (date != null) {
            LocalDate d = LocalDate.parse(date);
            return medicineRepo.findByDate(d);
        }
        return medicineRepo.findAll();
    }

    @PostMapping
    public Medicine addMedicine(@RequestBody MedicineRequest request) {
        Medicine med = new Medicine();
        med.setName(request.getName());
        med.setDosage(request.getDosage());
        med.setTime(LocalTime.parse(request.getTime())); 
        med.setNotes(request.getNotes());
        med.setDate(LocalDate.parse(request.getDate())); 
        med.setStatus("PENDING");
        return medicineRepo.save(med);
    }

    @PutMapping("/{id}/status")
    public Medicine updateStatus(@PathVariable Long id, @RequestParam String status) {
        Optional<Medicine> opt = medicineRepo.findById(id);
        if (opt.isEmpty()) {
            throw new RuntimeException("Medicine not found: " + id);
        }
        Medicine med = opt.get();
        med.setStatus(status.toUpperCase());
        return medicineRepo.save(med);
    }

    @DeleteMapping("/{id}")
    public void deleteMedicine(@PathVariable Long id) {
        medicineRepo.deleteById(id);
    }
}
