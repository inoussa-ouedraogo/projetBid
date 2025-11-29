package com.smartbid.backend.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.smartbid.backend.controller.dto.AuctionCreateRequest;
import com.smartbid.backend.controller.dto.AuctionResponse;
import com.smartbid.backend.controller.dto.AuctionUpdateRequest;
import com.smartbid.backend.controller.dto.BidResponse;
import com.smartbid.backend.model.AuctionStatus;
import com.smartbid.backend.service.AuctionService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auctions")
public class AuctionController {

    private final AuctionService service;

    public AuctionController(AuctionService service) {
        this.service = service;
    }

    // CREATE
    @PostMapping
    public ResponseEntity<AuctionResponse> create(@Valid @RequestBody AuctionCreateRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(req));
    }

    // DETAIL
    @GetMapping("/{id}")
    public ResponseEntity<AuctionResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    // LIST: /api/auctions?productId=...&status=RUNNING
    @GetMapping
    public ResponseEntity<List<AuctionResponse>> list(
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) AuctionStatus status,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String city,
            @RequestParam(value = "q", required = false) String query) {
        return ResponseEntity.ok(service.list(productId, status, category, query, city));
    }

    // UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<AuctionResponse> update(@PathVariable Long id,
                                                  @Valid @RequestBody AuctionUpdateRequest req) {
        return ResponseEntity.ok(service.update(id, req));
    }

    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
   // lister les enchères, mais par petites pages au lieu d’envoyer toute la liste d’un coup.
    @GetMapping("/paged")
    public ResponseEntity<Page<AuctionResponse>> listPaged(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt,DESC") String sort,
            @RequestParam(required = false) AuctionStatus status,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String city,
            @RequestParam(value = "q", required = false) String query) {
        String[] s = sort.split(",", 2);
        Sort order = Sort.by(
                Sort.Direction.fromString(s.length > 1 ? s[1] : "DESC"),
                s[0]
        );
        Pageable pageable = PageRequest.of(page, size, order);
        return ResponseEntity.ok(service.listPaged(pageable, status, category, query, city));
    }

    @GetMapping("/participated")
    public ResponseEntity<List<AuctionResponse>> participated() {
        return ResponseEntity.ok(service.listParticipated());
    }
@PostMapping("/{id}/close")
public ResponseEntity<AuctionResponse> closeNow(@PathVariable Long id) {
    return ResponseEntity.ok(service.closeAndPickWinner(id));
}
    @PostMapping("/{id}/buy-now")
    public ResponseEntity<AuctionResponse> buyNow(@PathVariable Long id,
                                                  @RequestBody com.smartbid.backend.controller.dto.BuyNowRequest req) {
        return ResponseEntity.ok(service.buyNow(id, req));
    }
   // START manual
    @PostMapping("/{id}/start")
    public ResponseEntity<AuctionResponse> startAuction(@PathVariable Long id) {
        return ResponseEntity.ok(service.startAuction(id));
    }
// AuctionController.java
@GetMapping("/{id}/winner")
public ResponseEntity<BidResponse> winner(@PathVariable Long id) {
    return ResponseEntity.ok(service.getWinner(id));
}
// 🔍 Lister les enchères selon la catégorie du produit
/*@GetMapping("/category/{category}")
public ResponseEntity<List<AuctionResponse>> listByCategory(@PathVariable String category) {
    return ResponseEntity.ok(service.listByCategory(category));
}
*/
@GetMapping("/category/{category}")
public ResponseEntity<List<AuctionResponse>> getByCategory(@PathVariable String category) {
    List<AuctionResponse> auctions = service.listByCategory(category);
    return ResponseEntity.ok(auctions);
}
    // List only my auctions (authenticated user). Optional filter by status.
    @GetMapping("/mine")
    public ResponseEntity<List<AuctionResponse>> mine(@RequestParam(required = false) AuctionStatus status) {
        return ResponseEntity.ok(service.listMine(status));
    }

}
